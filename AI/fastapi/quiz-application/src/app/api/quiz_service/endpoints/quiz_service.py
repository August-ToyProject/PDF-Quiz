
import asyncpg
from src.app.api.quiz_service.service.quiz_service import generate_quiz
from src.app.api.quiz_service.shema.quiz_request import QuizRequest
from src.packages.decorators.logging_decorator import log_decorator
from src.packages.decorators.processing_time import execution_time_decorator

from fastapi import APIRouter, HTTPException
from src.app.api.quiz_service.docs.quiz_service import desc_create_quiz
router = APIRouter()

# 서버 상태 체크
@router.get("/quiz/health")
async def health_check():
    return {"message": "It's Working On quiz Service!"}

@router.post(
    "/quiz/generate-quiz",
    tags=["퀴즈 생성"],
    name="Vecotr DB를 이용해서 퀴즈 생성",
    description=desc_create_quiz
    )

async def create_quiz(request: QuizRequest):
    try:
        quiz = await generate_quiz(request)
        return {"quiz": quiz}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")