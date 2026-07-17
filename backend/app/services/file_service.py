import os
import uuid
from pathlib import Path

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

EXT_TYPE_MAP = {
    ".pdf": "pdf", ".doc": "docx", ".docx": "docx", ".xls": "xlsx", ".xlsx": "xlsx",
    ".ppt": "pptx", ".pptx": "pptx", ".png": "image", ".jpg": "image", ".jpeg": "image",
    ".txt": "text", ".md": "markdown",
}


def detect_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return EXT_TYPE_MAP.get(ext, "outro")


def save_upload(filename: str, content: bytes) -> tuple[str, int]:
    unique_name = f"{uuid.uuid4()}_{filename}"
    dest = UPLOAD_DIR / unique_name
    dest.write_bytes(content)
    return str(dest), len(content)


def extract_text(path: str, file_type: str) -> str | None:
    try:
        if file_type in ("text", "markdown"):
            return Path(path).read_text(errors="ignore")[:20000]
    except Exception:
        pass
    return None
