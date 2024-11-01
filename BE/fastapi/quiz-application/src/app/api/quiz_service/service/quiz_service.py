import asyncio

from fastapi import HTTPException
from langchain_openai import ChatOpenAI
from langchain_teddynote.retrievers import KiwiBM25Retriever

from src.app.api.quiz_service.helpers.quiz_service import (
    load_vector,
    make_quiz,
)
from src.app.api.quiz_service.shema.quiz_request import QuizRequest


async def generate_quiz(request: QuizRequest):
    try:
        # 벡터 스토어 로드
        vector_store = await load_vector(request.index_path)

        # 문서 검색 (주제 기반 쿼리로 검색)
        # 주제와 키워드를 결합하여 더 정확한 문서 검색
        search_query = f"{request.subject}의 핵심 개념과 {', '.join(request.keywords[:3])}에 대한 내용"
        docs = vector_store.similarity_search(
            search_query,
            k=min(request.num_questions * 3, 10)  # 문서 수를 줄여 더 관련성 높은 문서만 선택
        )
        retriever = KiwiBM25Retriever.from_documents(docs)

        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.2
        )

        # 퀴즈 생성
        quiz = await make_quiz(
            llm=llm,
            retriever=retriever,
            subject=request.subject,
            keywords=request.keywords,  # 파일 서비스에서 받은 키워드 사용
            num_questions=request.num_questions,
            choice_count=5,
            user_difficulty_choice=request.difficulty,
            user_idx=request.user_idx,
            email=request.email,
            index_path=request.index_path
        )

        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"퀴즈 생성 중 오류 발생: {str(e)}")
