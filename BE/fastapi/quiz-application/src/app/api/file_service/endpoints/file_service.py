from datetime import date

import asyncpg
from fastapi import APIRouter, File, HTTPException, UploadFile
from src.app.api.file_service.service.file_service import save_pdf_to_faiss
from src.packages.decorators.logging_decorator import log_decorator
from src.packages.decorators.processing_time import execution_time_decorator

log_path = "src/app/api/file_service/logs"

router = APIRouter()

# 서버 상태 체크
@router.get("/file/health")
async def health_check():
    return {"message": "It's Working On file Service!"}


@router.post(
    "/file/pdf/upload"
    )
@execution_time_decorator(log_path)
@log_decorator(log_path)
async def pdf_upload(
    file: UploadFile = File(...),
):
    return await save_pdf_to_faiss(file)
    