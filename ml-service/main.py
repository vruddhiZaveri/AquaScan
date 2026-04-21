from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, UnidentifiedImageError
import tempfile
import os
import traceback

from predictor import predict_image, service_unavailable_response

app = FastAPI(title="AquaScan ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def normalize_uploaded_image(upload: UploadFile) -> str:
    suffix = os.path.splitext(upload.filename or "upload.jpg")[1].lower()
    if suffix not in ALLOWED_EXTENSIONS:
        suffix = ".jpg"

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_path = temp_file.name
    temp_file.close()

    try:
        upload.file.seek(0)
        image = Image.open(upload.file)
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")
        image.save(temp_path, format="JPEG", quality=95)
        return temp_path
    except UnidentifiedImageError as exc:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid readable image."
        ) from exc
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise


@app.get("/")
def root():
    return {"success": True, "message": "AquaScan ML service running"}


@app.get("/health")
def health():
    return {"success": True, "message": "healthy"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    temp_path = None
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded.")

        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

        temp_path = normalize_uploaded_image(file)
        result = predict_image(temp_path)
        return {"success": True, **result}

    except HTTPException:
        raise
    except Exception as e:
        print("===== ML /predict ERROR =====")
        print(str(e))
        traceback.print_exc()
        return {
            "success": False,
            **service_unavailable_response(
                "The local detection service failed while processing this image. Please try again or review the image manually."
            ),
        }
    finally:
        try:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception as cleanup_error:
            print("Temp cleanup error:", cleanup_error)