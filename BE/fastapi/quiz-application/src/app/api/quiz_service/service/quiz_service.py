import asyncio

from fastapi import HTTPException
from langchain_openai import ChatOpenAI

from src.app.api.quiz_service.helpers.quiz_service import (
    create_prompt_template,
    get_keyword_from_summary,
    get_subject_from_summary_docs,
    load_vector,
    make_quiz,
    summarize_document,
)
from src.app.api.quiz_service.shema.quiz_request import QuizRequest


async def generate_quiz(request: QuizRequest):
    try:
        #-- vector 스토어 꺼내오기
        vector_store = await load_vector(request.index_path)
        retriever = vector_store.as_retriever()
        docs = vector_store.similarity_search("", k=min(request.num_questions * 10, 10))

        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.2
        )

        #-- 문서 요약
        # llm, summary = await summarize_document(docs, temperature=0.1)

        #-- 주제 선정
        subject = await get_subject_from_summary_docs(llm, retriever)

        #-- 중요 키워드 추출
        keywords = await get_keyword_from_summary(
            llm,
            # summary,
            retriever=retriever,
            subject=subject,
            num_questions=request.num_questions,
            num_keywords=5
        )

        #-- 퀴즈 chain and make quiz
        quiz = await make_quiz(
            llm=llm,
            retriever=retriever,
            subject=subject,
            keywords=keywords,
            num_questions=request.num_questions,
            #선지 개수는 5개로 통일 
            choice_count=5,
            user_difficulty_choice=request.difficulty,
            user_idx=request.user_idx,
            email=request.email,
            index_path=request.index_path
        )
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"퀴즈 생성 중 오류 발생: {str(e)}")
