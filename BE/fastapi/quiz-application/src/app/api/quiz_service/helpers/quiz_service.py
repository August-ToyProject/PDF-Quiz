from langchain.chains.summarize import load_summarize_chain
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_openai import OpenAI
import asyncio

async def load_vector(index_path: str):
    embeddings = OpenAIEmbeddings()
    # 동기 메서드를 비동기 컨텍스트에서 실행
    vector_store = await asyncio.to_thread(
        FAISS.load_local, 
        index_path, 
        embeddings, 
        allow_dangerous_deserialization=True
    )
    return vector_store

async def summarize_document(docs, temperature = 0.5):
    try:
        llm = OpenAI(temperature=temperature)
        chain = load_summarize_chain(llm, chain_type="map_reduce")
        summary = await chain.arun(docs)
        return llm, summary
    except Exception as e:
        raise

async def get_keyword_from_summary(
    llm,
    summary,
    n=5
):
    try:
        keyword_prompt = PromptTemplate(
                input_variables=["summary", "n"],
                template="다음 요약에서 가장 중요한 {n}개의 키워드를 추출하세요:\n\n{summary}\n\n키워드:"
            )
        keyword_chain = LLMChain(
                llm=llm,
                prompt=keyword_prompt)
        keywords = await keyword_chain.arun(summary=summary, n=n)
        return keywords
    except Exception as e:
        raise

    
async def create_prompt_template(
    summary,
    keywords
):
    try:
        return PromptTemplate(
                input_variables=["summary", "keywords"],
                template=f"""
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
    except Exception as e:
        raise
async def make_quiz(
    llm,
    quiz_prompt,
    summary,
    keywords,
    num_questions=5
):
    try:
        quiz_chain = LLMChain(
            llm=llm, 
            prompt=quiz_prompt
            )

        questions = []
        for _ in range(num_questions):
            result = await quiz_chain.arun(summary=summary, keywords=keywords)
            questions.append(result.strip())

        final_result = "\n\n".join(questions)
        return final_result
    except Exception as e:
        raise