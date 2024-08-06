from datetime import date

import asyncpg
from src.packages.decorators.logging_decorator import log_decorator
from src.packages.decorators.processing_time import execution_time_decorator

from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()

# 서버 상태 체크
@router.get("/quiz/health")
async def health_check():
    return {"message": "It's Working On quiz Service!"}
