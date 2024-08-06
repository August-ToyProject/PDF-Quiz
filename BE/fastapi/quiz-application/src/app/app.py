import uvicorn
from fastapi import FastAPI
from fastapi.routing import APIRouter

from .urls import file_controller, quiz_controller

APP = FastAPI()

# APIRouter로 공통 경로 정의
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(file_controller.router)
api_router.include_router(quiz_controller.router)

APP.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run(APP, host="0.0.0.0", port=8000)