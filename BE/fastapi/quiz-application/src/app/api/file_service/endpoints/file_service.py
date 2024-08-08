import asyncpg
from fastapi import APIRouter, File, UploadFile
from src.app.api.file_service.service.file_service import save_pdf_to_faiss
from src.packages.decorators.logging_decorator import log_decorator
from src.packages.decorators.processing_time import execution_time_decorator
from src.app.api.file_service.docs.file_service import desc_pdf_upload

log_path = "src/app/api/file_service/logs"

router = APIRouter()

# 서버 상태 체크
@router.get("/file/health")
async def health_check():
    return {"message": "It's Working On file Service!"}

@router.post(
    "/files/upload/pdf",
    tags=["파일 업로드"],
    name="파일을 올리면 Vecotr DB에 저장",
    description=desc_pdf_upload
    )
@execution_time_decorator(log_path)
@log_decorator(log_path)
async def pdf_upload(
    file: UploadFile = File(...),
):
    return await save_pdf_to_faiss(file)
