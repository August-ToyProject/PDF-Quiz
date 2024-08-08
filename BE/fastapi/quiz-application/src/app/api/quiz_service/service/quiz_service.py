from fastapi import HTTPException


import asyncio
from langchain.prompts import PromptTemplate
from src.app.api.quiz_service.helpers.quiz_service import create_prompt_template, get_keyword_from_summary, load_vector, make_quiz, summarize_document


async def generate_quiz(index_path: str, num_questions: int):
    try:
        #-- vector 스토어 꺼내오기 
        vector_store = await load_vector(index_path)
        docs = vector_store.similarity_search("", k=min(num_questions * 2, 10))
        
        #-- 문서 요약
        llm, summary = await summarize_document(
            docs,
            temperature = 0.7
            )
        
        #-- 중요 키워드 추출
        keywords = await get_keyword_from_summary(
            llm,
            summary,
            n=num_questions * 3
        )
        
        #-- 퀴즈 생성
        quiz_prompt = await create_prompt_template(
            summary=summary,
            keywords=keywords
        ) 
        
        #-- 퀴즈 chain and make quiz
        quiz = await make_quiz(
            llm=llm,
            quiz_prompt=quiz_prompt,
            summary=summary,
            keywords=keywords,
            num_questions=num_questions
        )
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"퀴즈 생성 중 오류 발생: {str(e)}")

# validate_quiz 함수는 이전과 동일하게 유지
def validate_quiz(quiz_text, num_questions, context):
    questions = quiz_text.split("\n\n")
    if len(questions) != num_questions:
        raise ValueError(f"{num_questions}개의 문제를 요청했으나, {len(questions)}개가 생성되었습니다.")
    
    for q in questions:
        if not all(x in q for x in ['난이도:', '문제:', '가)', '나)', '다)', '라)', '정답:', '설명:']):
            raise ValueError(f"문제 형식이 올바르지 않습니다: {q}")
        
        explanation = q.split("설명: ")[-1].strip()
        if not any(phrase in context for phrase in explanation.split()):
            raise ValueError(f"설명이 주어진 내용을 참조하지 않습니다: {explanation}")
    
    return quiz_text
