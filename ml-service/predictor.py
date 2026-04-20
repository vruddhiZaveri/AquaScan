from ultralytics import YOLO
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "AquaScan_best.pt")
model = YOLO(MODEL_PATH)


def generate_aquascan_report(result):
    h, w = result.orig_shape
    image_area = h * w
    boxes = result.boxes

    if w < 400 or h < 400:
        return {
            "pollutionType": "Image Unclear",
            "severity": "UNKNOWN",
            "urgency": "N/A",
            "density": "Unknown",
            "coverage": "N/A",
            "confidence": "Low",
            "description": "The uploaded image is too small or unclear for reliable aquatic waste analysis.",
            "recommendation": "Please capture or upload a clearer image with better visibility of the water surface.",
            "needsBetterImage": True,
            "rawSource": "custom-yolo-model"
        }

    if boxes is None or len(boxes) == 0:
        return {
            "pollutionType": "No Significant Aquatic Waste Detected",
            "severity": "LOW",
            "urgency": "1/10",
            "density": "Minimal",
            "coverage": "0%",
            "confidence": "Low",
            "description": "The uploaded image appears clean and does not show any significant visible aquatic waste.",
            "recommendation": "No immediate cleanup action is required. Continue regular monitoring.",
            "needsBetterImage": False,
            "rawSource": "custom-yolo-model"
        }

    xyxy = boxes.xyxy.cpu().numpy()
    confs = boxes.conf.cpu().numpy()

    candidate_boxes = []
    candidate_confs = []
    candidate_area = 0

    strong_boxes = []
    strong_confs = []
    strong_area = 0

    for box, conf in zip(xyxy, confs):
        x1, y1, x2, y2 = box
        box_area = max(0, x2 - x1) * max(0, y2 - y1)
        area_ratio = box_area / image_area

        if area_ratio > 0.35:
            continue

        if conf >= 0.12:
            candidate_boxes.append(box)
            candidate_confs.append(float(conf))
            candidate_area += box_area

        if conf >= 0.30:
            strong_boxes.append(box)
            strong_confs.append(float(conf))
            strong_area += box_area

    avg_conf = float(np.mean(candidate_confs)) if candidate_confs else 0.0
    candidate_count = len(candidate_boxes)

    if candidate_count == 0 and avg_conf < 0.15:
        return {
            "pollutionType": "Image Unclear",
            "severity": "UNKNOWN",
            "urgency": "N/A",
            "density": "Unknown",
            "coverage": "N/A",
            "confidence": "Low",
            "description": "The image does not provide strong enough visual evidence for reliable waste analysis.",
            "recommendation": "Please capture or upload a clearer image with proper lighting and a visible water surface.",
            "needsBetterImage": True,
            "rawSource": "custom-yolo-model"
        }

    if candidate_count <= 2 and avg_conf < 0.20:
        return {
            "pollutionType": "No Significant Aquatic Waste Detected",
            "severity": "LOW",
            "urgency": "1/10",
            "density": "Minimal",
            "coverage": "0%",
            "confidence": "Low",
            "description": "The uploaded image appears clean or does not contain strong evidence of aquatic waste.",
            "recommendation": "No immediate cleanup action is required. Continue regular monitoring.",
            "needsBetterImage": False,
            "rawSource": "custom-yolo-model"
        }

    strong_coverage = min((strong_area / image_area) * 100, 100)
    candidate_coverage = min((candidate_area / image_area) * 100, 100)

    x_mins = [b[0] for b in candidate_boxes]
    y_mins = [b[1] for b in candidate_boxes]
    x_maxs = [b[2] for b in candidate_boxes]
    y_maxs = [b[3] for b in candidate_boxes]

    spread_width = (max(x_maxs) - min(x_mins)) / w if candidate_boxes else 0
    spread_height = (max(y_maxs) - min(y_mins)) / h if candidate_boxes else 0
    spread_score = (spread_width + spread_height) / 2

    effective_coverage = max(strong_coverage, candidate_coverage * 0.65)

    if candidate_count >= 10 and spread_score >= 0.55:
        effective_coverage += 18
    elif candidate_count >= 7 and spread_score >= 0.45:
        effective_coverage += 10
    elif candidate_count >= 4 and spread_score >= 0.35:
        effective_coverage += 5

    effective_coverage = min(effective_coverage, 100)

    if effective_coverage >= 35:
        density = "Very High"
    elif effective_coverage >= 18:
        density = "High"
    elif effective_coverage >= 7:
        density = "Moderate"
    else:
        density = "Low"

    if effective_coverage >= 25 or (candidate_count >= 8 and spread_score >= 0.5):
        severity = "HIGH"
        urgency = "9/10"
    elif effective_coverage >= 10 or (candidate_count >= 4 and spread_score >= 0.35):
        severity = "MEDIUM"
        urgency = "6/10"
    else:
        severity = "LOW"
        urgency = "3/10"

    if severity == "HIGH":
        pollution_type = "Heavy Floating Waste Pollution"
    elif severity == "MEDIUM":
        pollution_type = "Moderate Floating Waste Pollution"
    else:
        pollution_type = "Localized Floating Waste"

    if avg_conf >= 0.60:
        confidence = "High"
    elif avg_conf >= 0.30:
        confidence = "Medium"
    else:
        confidence = "Low"

    ui_coverage = round(float(effective_coverage), 1)

    if severity == "HIGH":
        description = (
            f"A large amount of floating waste is visible across the scene, with an estimated coverage "
            f"of {ui_coverage}% of the visible area. The pollution appears widespread and densely concentrated, "
            f"indicating severe aquatic pollution."
        )
        recommendation = (
            "Immediate cleanup action is recommended. Authorities or cleanup teams should prioritize "
            "this location and investigate the pollution source."
        )
    elif severity == "MEDIUM":
        description = (
            f"A noticeable amount of floating waste is present, with an estimated coverage of "
            f"{ui_coverage}% of the visible area. The pollution is moderate and should be addressed soon."
        )
        recommendation = (
            "Schedule cleanup soon and continue monitoring the water body for any increase in pollution."
        )
    else:
        description = (
            f"A small amount of visible floating waste is present, with an estimated coverage of "
            f"{ui_coverage}% of the visible area."
        )
        recommendation = (
            "Minor cleanup is recommended. Continue routine monitoring of the area."
        )

    return {
        "pollutionType": pollution_type,
        "severity": severity,
        "urgency": urgency,
        "density": density,
        "coverage": f"{ui_coverage}%",
        "confidence": confidence,
        "description": description,
        "recommendation": recommendation,
        "needsBetterImage": False,
        "rawSource": "custom-yolo-model"
    }


def predict_image(image_path: str) -> dict:
    results = model.predict(
        source=image_path,
        conf=0.25,
        iou=0.45,
        max_det=100,
        save=False,
        imgsz=512,
        verbose=False
    )

    result = results[0]
    return generate_aquascan_report(result)