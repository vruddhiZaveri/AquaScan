import os
import time
from typing import Any, Dict, List

import cv2
import numpy as np

try:
    from ultralytics import YOLO
except Exception:
    YOLO = None


MODEL_PATH = os.getenv("MODEL_PATH", "AquaScan_best.pt")
IMG_SIZE = int(os.getenv("YOLO_IMGSZ", "640"))
CONF_THRESHOLD = float(os.getenv("YOLO_CONF", "0.25"))
IOU_THRESHOLD = float(os.getenv("YOLO_IOU", "0.50"))
MAX_DET = int(os.getenv("YOLO_MAX_DET", "100"))
MAX_INPUT_DIM = int(os.getenv("MAX_INPUT_DIM", "1280"))
MIN_BLUR_SCORE = float(os.getenv("MIN_BLUR_SCORE", "20"))
MIN_DIM = int(os.getenv("MIN_INPUT_DIM", "160"))

INVALID_WATER_RATIO = float(os.getenv("INVALID_WATER_RATIO", "0.05"))
CLEAR_WATER_RATIO = float(os.getenv("CLEAR_WATER_RATIO", "0.12"))

model = None
if YOLO is not None:
    try:
        model = YOLO(MODEL_PATH)
        print(f"[ML] Loaded model: {MODEL_PATH}")
    except Exception as e:
        print(f"[ML] Failed to load YOLO model: {e}")
        model = None


def service_unavailable_response(
    message: str = "The local detection service is temporarily unavailable."
) -> Dict[str, Any]:
    return {
        "pollutionType": "Analysis Unavailable",
        "severity": "UNKNOWN",
        "urgency": "5/10",
        "confidence": 0.2,
        "status": "Review Needed",
        "actionNeeded": "Review Needed",
        "reportType": "Manual Review",
        "description": message,
        "recommendation": "Please retry with a clearer image or review the image manually.",
        "needsBetterImage": True,
        "reviewRequired": True,
        "rawSource": "ml-service-unavailable",
    }


def unclear_response(
    message: str = "The image is unclear or could not be interpreted reliably.",
    raw_source: str = "image-unclear",
) -> Dict[str, Any]:
    return {
        "pollutionType": "Image Unclear",
        "severity": "UNKNOWN",
        "urgency": "N/A",
        "confidence": 0.25,
        "status": "Review Needed",
        "actionNeeded": "Re-upload",
        "reportType": "Manual Review",
        "description": message,
        "recommendation": "Please upload a clearer image with the water surface visible.",
        "needsBetterImage": True,
        "reviewRequired": True,
        "rawSource": raw_source,
    }


def invalid_image_response() -> Dict[str, Any]:
    return {
        "pollutionType": "Non-Aquatic or Unsupported Scene",
        "severity": "UNKNOWN",
        "urgency": "N/A",
        "confidence": 0.3,
        "status": "Review Needed",
        "actionNeeded": "Re-upload",
        "reportType": "Manual Review",
        "description": "This image does not appear to show a valid aquatic scene. Please upload an image with a visible water body for pollution analysis.",
        "recommendation": "Upload a clearer image containing a lake, river, pond, shoreline, canal, or visible water surface.",
        "needsBetterImage": True,
        "reviewRequired": True,
        "rawSource": "aquatic-filter",
    }


def load_image(image_input: Any):
    if isinstance(image_input, np.ndarray):
        return image_input if image_input.size > 0 else None
    if isinstance(image_input, str):
        return cv2.imread(image_input)
    return None


def resize_for_inference(image: np.ndarray) -> np.ndarray:
    h, w = image.shape[:2]
    largest = max(h, w)
    if largest <= MAX_INPUT_DIM:
        return image

    scale = MAX_INPUT_DIM / float(largest)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def blur_score(image: np.ndarray) -> float:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def estimate_water_ratio(image: np.ndarray) -> float:
    small = cv2.resize(image, (384, 384), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    b, g, r = cv2.split(small)

    blue_mask = cv2.inRange(
        hsv,
        np.array([65, 20, 25]),
        np.array([140, 255, 255]),
    )

    reflective_mask = cv2.inRange(
        hsv,
        np.array([60, 0, 40]),
        np.array([160, 120, 255]),
    )

    blue_dominant = (
        (b.astype(np.int16) >= g.astype(np.int16) - 12)
        & (b.astype(np.int16) >= r.astype(np.int16) - 12)
    ).astype(np.uint8) * 255

    reflective_mask = cv2.bitwise_and(reflective_mask, blue_dominant)
    water_mask = cv2.bitwise_or(blue_mask, reflective_mask)
    water_mask = cv2.medianBlur(water_mask, 5)

    kernel = np.ones((5, 5), np.uint8)
    water_mask = cv2.morphologyEx(water_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    water_mask = cv2.morphologyEx(water_mask, cv2.MORPH_OPEN, kernel, iterations=1)

    ratio = float(cv2.countNonZero(water_mask)) / float(water_mask.size)
    return ratio


def is_probably_non_aquatic(image: np.ndarray, water_ratio: float) -> bool:
    """
    Generic non-aquatic validator.
    This is not for forests specifically — it is for any image that does not
    clearly show a water body.
    """
    if water_ratio >= INVALID_WATER_RATIO:
        return False

    small = cv2.resize(image, (256, 256), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)

    green_mask = cv2.inRange(
        hsv,
        np.array([35, 35, 25]),
        np.array([95, 255, 255]),
    )

    blue_like_mask = cv2.inRange(
        hsv,
        np.array([75, 10, 25]),
        np.array([145, 255, 255]),
    )

    edge_density = cv2.Canny(gray, 80, 160)
    edge_ratio = float(cv2.countNonZero(edge_density)) / float(edge_density.size)
    green_ratio = float(cv2.countNonZero(green_mask)) / float(green_mask.size)
    blue_like_ratio = float(cv2.countNonZero(blue_like_mask)) / float(blue_like_mask.size)

    # Low water evidence + visually non-water scene
    if water_ratio < 0.03 and blue_like_ratio < 0.08 and edge_ratio > 0.08:
        return True

    if water_ratio < 0.035 and green_ratio > 0.18 and edge_ratio > 0.08:
        return True

    return False


def run_yolo(image: np.ndarray):
    if model is None:
        raise RuntimeError("YOLO model is not loaded.")

    results = model.predict(
        source=image,
        conf=CONF_THRESHOLD,
        iou=IOU_THRESHOLD,
        max_det=MAX_DET,
        imgsz=IMG_SIZE,
        verbose=False,
        augment=False,
    )
    return results[0]


def confidence_label_to_score(label: str) -> float:
    mapping = {
        "Low": 0.45,
        "Medium": 0.72,
        "High": 0.90,
    }
    return mapping.get(label, 0.55)


def get_detected_items(result) -> List[str]:
    items = []
    try:
        if result.boxes is None or result.boxes.cls is None:
            return items

        class_ids = result.boxes.cls.cpu().numpy().astype(int).tolist()
        names = result.names if hasattr(result, "names") else {}

        for cid in class_ids:
            item = names.get(cid, f"class_{cid}")
            items.append(str(item))
    except Exception:
        pass
    return items


def generate_clear_water_response(
    water_ratio: float,
    source: str,
    blurry_scene: bool = False,
) -> Dict[str, Any]:
    confidence = 0.74 if water_ratio >= 0.16 else 0.66

    return {
        "pollutionType": "No Significant Aquatic Waste Detected",
        "severity": "LOW",
        "urgency": "1/10",
        "confidence": round(confidence, 2),
        "status": "Review Needed" if blurry_scene else "Live",
        "actionNeeded": "Monitor",
        "reportType": "Clear Water",
        "density": "Minimal",
        "coverage": "0%",
        "description": (
            "The uploaded image appears to show a valid water body with no significant visible floating waste. "
            "The water surface looks clean in this image."
            if not blurry_scene
            else "The water body appears mostly clean, but the image is blurry, so a clearer image is recommended for confirmation."
        ),
        "recommendation": (
            "No immediate cleanup action is required. Continue regular monitoring of the area."
            if not blurry_scene
            else "Please upload a clearer image if you want a more reliable clean-water confirmation."
        ),
        "needsBetterImage": blurry_scene,
        "reviewRequired": blurry_scene,
        "rawSource": source if not blurry_scene else "blurry-clean-water",
        "meta": {
            "waterRatio": round(water_ratio, 4),
            "blurryScene": blurry_scene,
        },
    }


def generate_aquascan_report(
    result,
    water_ratio: float,
    blurry_scene: bool = False,
) -> Dict[str, Any]:
    h, w = result.orig_shape
    image_area = max(h * w, 1)
    boxes = result.boxes

    if w < MIN_DIM or h < MIN_DIM:
        return unclear_response(
            "The uploaded image is too small or unclear for reliable aquatic waste analysis."
        )

    if boxes is None or len(boxes) == 0:
        if water_ratio < INVALID_WATER_RATIO:
            return invalid_image_response()

        if water_ratio < CLEAR_WATER_RATIO:
            return unclear_response(
                "Possible aquatic scene detected, but the visible water region is too limited for a confident clean-water assessment.",
                raw_source="low-water-unclear",
            )

        return generate_clear_water_response(
            water_ratio,
            "yolo-clean",
            blurry_scene=blurry_scene,
        )

    xyxy = boxes.xyxy.cpu().numpy() if boxes.xyxy is not None else np.empty((0, 4))
    confs = boxes.conf.cpu().numpy() if boxes.conf is not None else np.empty((0,))
    classes = boxes.cls.cpu().numpy() if boxes.cls is not None else np.empty((0,))

    candidate_boxes = []
    candidate_confs = []
    candidate_area = 0.0

    strong_boxes = []
    strong_area = 0.0

    for box, conf, _cls_id in zip(xyxy, confs, classes):
        x1, y1, x2, y2 = [float(v) for v in box]
        box_area = max(0.0, x2 - x1) * max(0.0, y2 - y1)
        area_ratio = box_area / float(image_area)

        if area_ratio > 0.45 or area_ratio < 0.00003:
            continue

        if conf >= CONF_THRESHOLD:
            candidate_boxes.append([x1, y1, x2, y2])
            candidate_confs.append(float(conf))
            candidate_area += box_area

        if conf >= 0.35:
            strong_boxes.append([x1, y1, x2, y2])
            strong_area += box_area

    candidate_count = len(candidate_boxes)
    avg_conf = float(np.mean(candidate_confs)) if candidate_confs else 0.0

    if candidate_count == 0:
        if water_ratio < INVALID_WATER_RATIO:
            return invalid_image_response()

        if water_ratio < CLEAR_WATER_RATIO:
            return unclear_response(
                "The image may contain water, but there is not enough visible water for a confident clean-water decision.",
                raw_source="low-water-after-filter",
            )

        return generate_clear_water_response(
            water_ratio,
            "yolo-filtered-clean",
            blurry_scene=blurry_scene,
        )

    if candidate_count <= 2 and avg_conf < 0.30:
        if water_ratio < INVALID_WATER_RATIO:
            return invalid_image_response()

        if water_ratio < CLEAR_WATER_RATIO:
            return unclear_response(
                "Weak detection evidence was found, but the aquatic region is too limited for a reliable conclusion.",
                raw_source="weak-detection-unclear",
            )

        return generate_clear_water_response(
            water_ratio,
            "yolo-weak-clean",
            blurry_scene=True,
        )

    strong_coverage = min((strong_area / image_area) * 100.0, 100.0)
    candidate_coverage = min((candidate_area / image_area) * 100.0, 100.0)

    x_mins = [b[0] for b in candidate_boxes]
    y_mins = [b[1] for b in candidate_boxes]
    x_maxs = [b[2] for b in candidate_boxes]
    y_maxs = [b[3] for b in candidate_boxes]

    spread_width = (max(x_maxs) - min(x_mins)) / max(w, 1)
    spread_height = (max(y_maxs) - min(y_mins)) / max(h, 1)
    spread_score = (spread_width + spread_height) / 2.0

    effective_coverage = max(strong_coverage, candidate_coverage * 0.65)

    if candidate_count >= 10 and spread_score >= 0.55:
        effective_coverage += 18.0
    elif candidate_count >= 7 and spread_score >= 0.45:
        effective_coverage += 10.0
    elif candidate_count >= 4 and spread_score >= 0.35:
        effective_coverage += 5.0

    effective_coverage = min(effective_coverage, 100.0)

    if effective_coverage >= 35:
        density = "Very High"
    elif effective_coverage >= 18:
        density = "High"
    elif effective_coverage >= 7:
        density = "Moderate"
    else:
        density = "Low"

    # Adjusted thresholds:
    # 1st and 2nd polluted images should lean MEDIUM, not LOW
    if effective_coverage >= 22 or (candidate_count >= 8 and spread_score >= 0.48):
        severity = "HIGH"
        urgency = "9/10"
        pollution_type = "Heavy Floating Waste Pollution"
        action_needed = "Immediate Cleanup"
    elif effective_coverage >= 6 or (candidate_count >= 3 and spread_score >= 0.28):
        severity = "MEDIUM"
        urgency = "6/10"
        pollution_type = "Moderate Floating Waste Pollution"
        action_needed = "Schedule Cleanup"
    else:
        severity = "LOW"
        urgency = "3/10"
        pollution_type = "Localized Floating Waste"
        action_needed = "Minor Cleanup"

    conf_label = "High" if avg_conf >= 0.60 else "Medium" if avg_conf >= 0.35 else "Low"
    confidence_score = confidence_label_to_score(conf_label)

    if water_ratio < CLEAR_WATER_RATIO:
        confidence_score = max(0.45, confidence_score - 0.08)

    if blurry_scene:
        confidence_score = max(0.45, confidence_score - 0.10)

    ui_coverage = round(float(effective_coverage), 1)

    if severity == "HIGH":
        description = (
            f"A large amount of floating waste is visible across the scene, with an estimated coverage of "
            f"{ui_coverage}% of the visible area. The pollution appears widespread and densely concentrated."
        )
        recommendation = (
            "Immediate cleanup action is recommended. Authorities or cleanup teams should prioritize this location "
            "and investigate the pollution source."
        )
    elif severity == "MEDIUM":
        description = (
            f"A noticeable amount of floating waste is present, with an estimated coverage of {ui_coverage}% of "
            "the visible area. The pollution is moderate and should be addressed soon."
        )
        recommendation = "Schedule cleanup soon and continue monitoring the water body for any increase in pollution."
    else:
        description = (
            f"A small amount of visible floating waste is present, with an estimated coverage of {ui_coverage}% "
            "of the visible area."
        )
        recommendation = "Minor cleanup is recommended. Continue routine monitoring of the area."

    # If blurry, mention it clearly instead of acting overconfident
    if blurry_scene:
        if severity == "HIGH":
            description = (
                "Floating waste appears to be present, but the image is blurry. "
                "The scene suggests heavy pollution, though the result should be manually reviewed."
            )
        elif severity == "MEDIUM":
            description = (
                "Possible moderate floating waste is visible, but the image is blurry, so the result may be unreliable."
            )
        else:
            description = (
                "Possible localized floating waste is visible, but the image is blurry. "
                "A clearer image is recommended for confirmation."
            )

        recommendation = "Please upload a clearer image for a more reliable assessment."

    detected_items = get_detected_items(result)

    return {
        "pollutionType": pollution_type,
        "severity": severity,
        "urgency": urgency,
        "confidence": round(float(confidence_score), 2),
        "status": "Review Needed" if blurry_scene else "Live",
        "actionNeeded": "Review Needed" if blurry_scene else action_needed,
        "reportType": "Polluted Water",
        "density": density,
        "coverage": f"{ui_coverage}%",
        "description": description,
        "recommendation": recommendation,
        "needsBetterImage": blurry_scene,
        "reviewRequired": blurry_scene,
        "rawSource": "blurry-polluted-water" if blurry_scene else "kaggle-yolo-report",
        "detectedItems": detected_items,
        "meta": {
            "candidateCount": candidate_count,
            "strongCount": len(strong_boxes),
            "avgDetectionConfidence": round(avg_conf, 4),
            "waterRatio": round(water_ratio, 4),
            "spreadScore": round(spread_score, 4),
            "candidateCoverage": round(candidate_coverage, 2),
            "strongCoverage": round(strong_coverage, 2),
            "blurryScene": blurry_scene,
        },
    }


def predict_image(image_input: Any) -> Dict[str, Any]:
    started = time.time()

    try:
        image = load_image(image_input)
        if image is None:
            return unclear_response("The uploaded image could not be decoded.")

        image = resize_for_inference(image)
        h, w = image.shape[:2]

        if h < MIN_DIM or w < MIN_DIM:
            return unclear_response(
                "The uploaded image is too small or unclear for reliable aquatic waste analysis."
            )

        blur = blur_score(image)
        water_ratio = estimate_water_ratio(image)

        # Generic non-aquatic check
        if is_probably_non_aquatic(image, water_ratio):
            return invalid_image_response()

        # Blur should be handled independently and clearly surfaced
        blurry_scene = blur < MIN_BLUR_SCORE

        result = run_yolo(image)
        report = generate_aquascan_report(
            result,
            water_ratio,
            blurry_scene=blurry_scene,
        )

        print(
            f"[ML] total={round(time.time() - started, 3)}s "
            f"blur={round(blur, 2)} "
            f"water_ratio={round(water_ratio, 4)} "
            f"severity={report.get('severity')} "
            f"source={report.get('rawSource')}"
        )

        return report

    except Exception as exc:
        print(f"[ML] predictor_error: {exc}")
        return service_unavailable_response(f"Local ML failed: {exc}")