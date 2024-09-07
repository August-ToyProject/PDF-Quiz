from langchain.chains.summarize import load_summarize_chain
from langchain_anthropic import ChatAnthropic
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables import RunnableParallel
from langchain_openai import ChatOpenAI
import asyncio
import random
import json
from confluent_kafka import Producer

# Kafka Producer 설정
producer_config = {
    'bootstrap.servers': 'localhost:9092',  # Kafka 브로커 주소
    'client.id': 'fastapi-producer',         # 클라이언트 ID
}
producer = Producer(producer_config)

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

async def get_subject_from_summary_docs(
    llm,
    retriever
):
    try:
        subject_prompt = PromptTemplate(
            template="""
            주어진 요약과 context를 보고 해당 내용의 가장 주된 **도메인**이나 **주제**를 한 단어 또는 짧은 구문으로 추출해주세요.
            1. 문서의 내용이 어느 분야에 속하는지, 주요 주제가 무엇인지를 포괄하는 단어를 선택하세요.
            2. 너무 구체적인 세부사항 대신, 전체적인 주제나 도메인을 파악하세요.
            3. 예시: '데이터베이스', '소프트웨어 개발', '마케팅 전략' 등.
            4. 주제를 하나의 단어 또는 짧은 구문으로 요약해 제시해주세요.
            
            #context를:
            {context}
            """
            )
        subject_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | subject_prompt
        | llm
        | StrOutputParser()
        )
        question = "해당 문서의 주제는?"
        subject = subject_chain.invoke(question)
        
        return subject
    except Exception as e:
        raise e

async def summarize_document(
    docs, 
    model_name="gpt-4o-mini",
    temperature = 0
    ):
    try:
        llm = ChatOpenAI(
            model_name=model_name, 
            temperature=temperature
            )
        chain = load_summarize_chain(
            llm, 
            chain_type="map_reduce"
            )
        summary = await chain.arun(docs)
        return llm, summary
    except Exception as e:
        raise e

async def get_keyword_from_summary(
    llm,
    summary,
    subject,
    retriever,
    num_questions=5,
    num_keywords =2
):
    try:
        total_keyword = num_questions * num_keywords
        keyword_prompt = PromptTemplate(
            template="""
        주어진 요약과 context, 주제를 보고 가장 중요하고 관련성 높은 {n}개의 키워드를 추출해주세요. 다음 지침을 따라주세요:

        1. 키워드는 문서의 주제, 핵심 개념, 중요한 용어를 대표해야 합니다.
        2. 단일 단어와 짧은 구문 모두 포함할 수 있습니다.
        3. 다양한 주제 영역을 포괄하도록 키워드를 선택하세요.
        4. 고유명사, 전문 용어, 주요 개념을 우선적으로 선택하세요.
        5. 키워드를 중요도 순으로 정렬하여 제시해주세요.
        6. 각 키워드는 쉼표로 구분하고, 마지막에 마침표를 찍지 마세요.

        #요약:
        {summary}
        
        #contenxt:
        {context}
        
        #주제:
        {subject}

        키워드 (중요도 순):"""
        )
        
        # RunnableParallel을 이용해 여러 값을 병렬로 처리
        keyword_chain = (
            RunnableParallel(
                context=RunnablePassthrough(),
                summary=RunnablePassthrough(),
                subject=RunnablePassthrough(),
                n=RunnablePassthrough(),
                question=RunnablePassthrough()
            )
            | keyword_prompt
            | llm
            | StrOutputParser()
        )

        # 전달할 input 데이터 정의
        question = f"{subject}와 가장 관련도가 높은 키워드를 알려줘"
        input_data = {
            "context":retriever,
            "summary": summary,
            "subject": subject,
            "n": total_keyword,
            "question": question
        }

        # keyword_chain 실행
        keywords = keyword_chain.invoke(input_data)
        keyword_list = [kw.strip() for kw in keywords.split(',')]
        
        num_groups = num_questions//5
        
        ret = []
        start = 0
        for _ in range(num_groups):
            end = start + (5*num_keywords)
            ret .append(keyword_list[start:end])
            start =  end
        return ret
    except Exception as e:
        raise e

    
async def create_prompt_template():
    try:
        return PromptTemplate(
            input_variables=["document", "keywords", "num_questions", "choice_count", "difficulty"],
            template="""
            당신은 가장 뛰어난 퀴즈 생성에 대해 전문 지식을 가지고 있는 퀴즈 생성자입니다. 아래 조건을 보고 퀴즈를 만들어주세요.
            다음 문서에서 키워드에 해당하는 중요한 개념을 바탕으로 객관식 문제 5개를 만드세요 
            문제 보기는 1~{choice_count}까지 다양하게 해주세요:
            
            문서: {document}

            키워드: {keywords}
            
            1. {choice_count}개의 선택지(1부터 {choice_count}까지 번호 매김)와 하나의 정답을 포함해야 합니다.
            2. 난이도는 {difficulty}입니다.
            3. 정답에 대한 간단한 설명을 제공하되, 반드시 주어진 요약이나 키워드에서 정보를 인용하세요.
            4. 다음 형식을 사용하세요:

            난이도: [쉬움/보통/어려움]
            문제: [문제 내용]
            1) [선택지 1]
            2) [선택지 2]
            ...
            {choice_count}) [선택지 {choice_count}]
            정답: [정답 선택지]
            설명: [내용을 참조한 간단한 설명]

            예시:

            3개 선택지 예시:
            난이도: 쉬움
            문제: 인공지능(AI)의 주요 목표는 무엇인가요?
            1) 인간의 지능을 모방하고 인간과 유사한 방식으로 문제를 해결하는 것
            2) 최대한 많은 데이터를 수집하는 것
            3) 가장 빠른 컴퓨터를 만드는 것
            정답: 1
            설명: 문서에서 언급된 대로, AI의 주요 목표는 인간의 지능을 모방하고 인간과 유사한 방식으로 문제를 해결하는 것입니다.

            4개 선택지 예시:
            난이도: 보통
            문제: 머신러닝의 주요 특징은 무엇인가요?
            1) 명시적인 프로그래밍 없이 데이터로부터 학습한다
            2) 항상 사람의 개입이 필요하다
            3) 오직 이미지 처리에만 사용된다
            4) 컴퓨터 하드웨어의 성능을 향상시킨다
            정답: 1
            설명: 문서에서 언급된 대로, 머신러닝은 데이터로부터 학습하여 성능을 향상시키는 알고리즘을 연구합니다.

            5개 선택지 예시:
            난이도: 어려움
            문제: 딥러닝이 다른 머신러닝 기법과 구별되는 주요 특징은 무엇인가요?
            1) 단층 신경망만을 사용한다
            2) 다층 신경망을 사용하여 복잡한 패턴을 학습하고 추상화할 수 있다
            3) 오직 지도 학습에만 사용된다
            4) 항상 소량의 데이터만으로 학습할 수 있다
            5) 컴퓨터 비전 분야에만 적용된다
            정답: 2
            설명: 문서에서 언급된 대로, 딥러닝은 다층 신경망을 사용하여 복잡한 패턴을 학습하고 추상화할 수 있는 머신러닝의 한 기법입니다.

            위 예시들을 참고하여 5개의 문제를 생성하세요. 각 문제는 서로 다른 개념을 다뤄야 합니다.
            """
        )
    except Exception as e:
        raise e
    
async def get_weighted_difficulties(user_choice):
    difficulties = ["쉬움", "보통", "어려움"]
    if user_choice == 1:
        weights = [0.6, 0.3, 0.1]
    elif user_choice == 2:
        weights = [0.2, 0.6, 0.2]
    elif user_choice == 3:
        weights = [0.1, 0.3, 0.6]
    else:
        weights = [1/3, 1/3, 1/3]  # 균등한 가중치
    return difficulties, weights    

import json
import random

async def make_quiz(
    retriever,
    keywords,
    user_idx,
    email,
    index_path,
    num_questions=5,
    choice_count=4,
    user_difficulty_choice=None
):
    try:
        difficulties, weights = await get_weighted_difficulties(user_difficulty_choice)
        num_questions = num_questions // 5
        for i in range(num_questions):
            # 가중치를 적용하여 난이도 선택
            difficulty = random.choices(difficulties, weights=weights, k=1)[0]
            
            openai_llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)    
            quiz_prompt = await create_prompt_template() 
            
            input_data = {
                "document": retriever,
                "keywords": ', '.join(keywords[i]),
                "choice_count": choice_count,
                "difficulty": difficulty
            }
            
            quiz_chain = (
                quiz_prompt | openai_llm
                )
            result= quiz_chain.invoke(input_data).content

            # Kafka로 퀴즈 및 추가 정보를 전송 (JSON 직렬화 후 UTF-8 인코딩, ensure_ascii=False 추가)
            quiz_data = {
                'user_idx': user_idx,
                'email': email,
                'index_path': index_path,
                'question': result.strip()
            }
            producer.produce('quiz_topic', json.dumps(quiz_data, ensure_ascii=False).encode('utf-8'))

        producer.flush()  # 모든 메시지가 전송되었는지 확인
        return {"status": "Quizzes sent to Kafka"}
    except Exception as e:
        raise e