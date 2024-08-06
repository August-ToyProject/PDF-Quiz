from datetime import date

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from src.packages.decorators.logging_decorator import log_decorator
from src.packages.decorators.processing_time import execution_time_decorator

router = APIRouter()

# 서버 상태 체크
@router.get("/file/health")
async def health_check():
    return {"message": "It's Working On file Service!"}
