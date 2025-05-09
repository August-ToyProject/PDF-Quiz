import uvicorn
from fastapi import FastAPI
from fastapi.routing import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from .urls import file_controller, quiz_controller
from dotenv import load_dotenv
from langchain_teddynote import logging

load_dotenv()
logging.langsmith("QUIZ_GEN")
APP = FastAPI()

# APIRouter로 공통 경로 정의
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(file_controller.router)
api_router.include_router(quiz_controller.router)

APP.include_router(api_router)

# CORS 설정
origins = [
    "http://localhost",
    "http://localhost:8080",
    # 필요에 따라 더 많은 출처를 추가할 수 있습니다.
]

APP.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 허용할 출처 리스트
    allow_credentials=True,
    allow_methods=["*"],  # 허용할 HTTP 메소드
    allow_headers=["*"],  # 허용할 HTTP 헤더
)

if __name__ == "__main__":
    uvicorn.run(APP, host="0.0.0.0", port=8000)
