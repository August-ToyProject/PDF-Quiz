from fastapi import HTTPException
from langchain.chains import LLMChain
from langchain_openai import OpenAI
import asyncio
from langchain.prompts import PromptTemplate
from src.app.api.quiz_service.helpers.quiz_service import load_vector
from langchain.chains.summarize import load_summarize_chain

async def generate_quiz(index_path: str, num_questions: int):
    try:
        vector_store = await load_vector(index_path)
        docs = vector_store.similarity_search("", k=min(num_questions * 2, 10))
        
        # 문서 요약
        llm = OpenAI(temperature=0.5)
        chain = load_summarize_chain(llm, chain_type="map_reduce")
        summary = await chain.arun(docs)

        # 중요 키워드 추출
        keyword_prompt = PromptTemplate(
            input_variables=["summary"],
            template="다음 요약에서 가장 중요한 5개의 키워드를 추출하세요:\n\n{summary}\n\n키워드:"
        )
        keyword_chain = LLMChain(llm=llm, prompt=keyword_prompt)
        keywords = await keyword_chain.arun(summary=summary)

        # 퀴즈 생성
        quiz_prompt = PromptTemplate(
            input_variables=["summary", "keywords"],
            template="""
            다음 요약과 키워드를 바탕으로 중요한 개념에 대한 객관식 문제 하나를 만드세요:
            
            요약: {summary}
            
            키워드: {keywords}
            
            1. 4개의 선택지(가, 나, 다, 라)와 하나의 정답을 포함해야 합니다.
            2. 난이도(쉬움, 보통, 어려움)를 지정하세요.
            3. 정답에 대한 간단한 설명을 제공하되, 반드시 주어진 요약이나 키워드에서 정보를 인용하세요.
            4. 다음 형식을 사용하세요:

            난이도: [쉬움/보통/어려움]
            문제: [문제 내용]
            가) [선택지 가]
            나) [선택지 나]
            다) [선택지 다]
            라) [선택지 라]
            정답: [정답 선택지]
            설명: [내용을 참조한 간단한 설명]
            """
        )
        
        quiz_chain = LLMChain(llm=llm, prompt=quiz_prompt)

        questions = []
        for _ in range(num_questions):
            result = await quiz_chain.arun(summary=summary, keywords=keywords)
            questions.append(result.strip())

        final_result = "\n\n".join(questions)
        return final_result

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
