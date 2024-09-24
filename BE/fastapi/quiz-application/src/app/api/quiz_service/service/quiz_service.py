import asyncio

from fastapi import HTTPException
from langchain_openai import ChatOpenAI
from langchain_teddynote.retrievers import KiwiBM25Retriever

from src.app.api.quiz_service.helpers.quiz_service import (
    get_keyword_from_summary,
    get_subject_from_summary_docs,
    load_vector,
    make_quiz,
)
from src.app.api.quiz_service.shema.quiz_request import QuizRequest


async def generate_quiz(request: QuizRequest):
    try:
        # 벡터 스토어 로드
        vector_store = await load_vector(request.index_path)

        # Step 1: 초기 문서 검색 (빈 쿼리로)
        docs = vector_store.similarity_search("", k=min(request.num_questions * 10, 10))
        retriever = KiwiBM25Retriever.from_documents(docs)

        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.2
        )

        # 주제와 키워드 추출
        subject = await get_subject_from_summary_docs(llm, retriever)
        keywords = await get_keyword_from_summary(
            llm,
            retriever=retriever,
            subject=subject,
            num_questions=request.num_questions,
            num_keywords=5
        )

        # Step 2: 키워드를 기반으로 자연스러운 쿼리 생성
        keyword_sentence = create_natural_query_from_keywords(keywords)

        # 검색 수행 (자연어 기반 쿼리로 검색)
        docs = vector_store.similarity_search(keyword_sentence, k=min(request.num_questions * 10, 10))

        # 재검색한 문서들을 기반으로 retriever 업데이트
        retriever = KiwiBM25Retriever.from_documents(docs)

        # 퀴즈 생성
        quiz = await make_quiz(
            llm=llm,
            retriever=retriever,
            subject=subject,
            keywords=keywords,  # 키워드 전달
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

def create_natural_query_from_keywords(keywords):
    # 2차원 배열을 평탄화하여 1차원 리스트로 변환
    flattened_keywords = [keyword for group in keywords for keyword in group]
    # 모든 키워드를 문장에 포함
    query = f"이 문서는 {', '.join(flattened_keywords)} 등의 주제와 관련이 있습니다. 이러한 내용을 포함하는 문서를 찾고 싶습니다."
    return query
