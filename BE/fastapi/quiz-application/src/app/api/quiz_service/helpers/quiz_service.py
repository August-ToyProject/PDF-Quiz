import asyncio
import json
import random
import time
import re

from confluent_kafka import Producer
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate
from langchain_anthropic import ChatAnthropic
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

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
        subject_prompt = PromptTemplate.from_template(
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
    temperature=0
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
        summary = await chain.ainvoke(docs)
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
        keyword_prompt = PromptTemplate.from_template(
            template="""
        주어진 요약과 문서의 내용을 바탕으로 가장 중요하고 관련성 높은 {n}개의 키워드를 추출해 주시기 바랍니다. 추출 시 다음 지침을 준수해 주시면 감사하겠습니다:
        1. 키워드는 문서의 주제, 핵심 개념, 그리고 중요한 용어를 대표해야 합니다.
        2. 각 키워드는 유일해야 하며, 개념적으로 비슷한 키워드는 하나의 키워드로 통합해 주십시오.
        3. 단일 단어뿐만 아니라 짧은 구문도 포함될 수 있습니다.
        4. 키워드는 다양한 주제 영역을 포괄할 수 있도록 선택해 주시기 바랍니다.
        5. 고유명사, 전문 용어, 주요 개념을 우선적으로 선택해 주십시오.
        6. 키워드는 중요도 순으로 정렬해 주십시오.
        7. 각 키워드는 쉼표로 구분해 주시고, 마지막에는 마침표를 찍지 말아 주십시오.


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
        question = f"{subject}와 가장 관련도가 높은 {total_keyword}개의 키워드를 알려줘"
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
        return PromptTemplate.from_template(
            template="""
            당신은 {subject} 분야에서 가장 뛰어난 퀴즈 문제 생성에 대해 전문 지식을 가지고 있는 퀴즈 생성자입니다. 아래 조건을 참고하여 자격증 공부를 하는 학습자를 위한 객관식 문제를 만들어 주시기 바랍니다.
            1. 주어진 주제를 바탕으로 retrievered context를 이용해서, keywords에 해당하는 중요한 개념을 근거로 객관식 문제 5개를 생성해 주십시오.\n
            2. 난이도에 따라 키워드를 여러 개 조합하여 문제를 구성해 주세요. 쉬운 문제는 1~2개의 키워드로, 중간 난이도의 문제는 3~5개의 키워드를, 어려운 문제는 5개 이상의 키워드를 사용해 주세요.\n
            3. 사용된 문제와 동일하거나 비슷한 문제는 절대로 생성하지 말아 주십시오.\n
            4. 문제를 생성할 때 {used_keywords}와 비슷한 개념이 있으면 안됩니다.\n
            5. {choice_count}개의 선택지(1번부터 {choice_count}번까지 번호를 매김)와 하나의 정답을 포함해 주세요.\n
            -  **정답 번호는 {answer_list}번호 중 하나의 값을 사용하며 반드시 균등하게 사용해야 합니다.**\n
            6. 난이도는 {user_difficulty_choice}입니다.\n
            7. 각 문제의 정답에 대해 간단한 설명을 추가해 주시되, 반드시 주어진 context와 키워드에서 정보를 인용해 주세요.\n
            8. 문제의 난이도는 {user_difficulty_choice}이며, 난이도에 맞게 문제의 난이도를 적절히 분배해 주십시오.\n
            9. 문단을 나누기 위해 ###과 같은 특수문자는 사용하지 말아 주세요.\n
            10. 형식을 제외한 다른 대답은 하지마세요.\n

            #주제
            주제 : {subject}

            #사용된 문제
            사용된 문제 : {used_questions}

            #context
            context : {context}

            #keywords
            keywords : {keywords}

            #answer_list
            answer_list : {answer_list}

            문제 만들 때 다음 형식을 따라주세요:
            난이도: [쉬움/보통/어려움]
            키워드: [사용된 키워드]
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
            키워드: 인공지능
            문제: 인공지능(AI)의 주요 목표는 무엇인가요?
            1) 인간의 지능을 모방하고 인간과 유사한 방식으로 문제를 해결하는 것
            2) 최대한 많은 데이터를 수집하는 것
            3) 가장 빠른 컴퓨터를 만드는 것
            정답: 1
            설명: 문서에서 언급된 대로, AI의 주요 목표는 인간의 지능을 모방하고 인간과 유사한 방식으로 문제를 해결하는 것입니다.


            4개 선택지 예시:
            난이도: 보통
            키워드: 머신러닝
            문제: 머신러닝의 주요 특징 중 옳지 않은 것은 무엇인가요?
            1) 명시적인 프로그래밍 없이 데이터로부터 학습한다
            2) 항상 사람의 개입이 필요하다
            3) 오직 이미지 처리에만 사용된다
            4) 데이터로부터 패턴을 학습하여 성능을 향상시킨다
            정답: 2
            설명: 머신러닝은 명시적 프로그래밍 없이 스스로 데이터로부터 학습하며, 사람의 개입이 항상 필요한 것은 아닙니다.
            5개 선택지 예시:
            난이도: 어려움
            키워드: 딥러닝
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

import random


async def make_quiz(
    retriever,
    keywords,
    subject,
    user_idx,
    email,
    index_path,
    num_questions=5,
    choice_count=4,
    user_difficulty_choice=None
):
    try:
        pattern = r"문제:\s(.*?)\s\n"
        used_questions = ""
        required_quiz_count = num_questions
        num_questions = num_questions // 5
        answer_list = [1, 2, 3, 4, 5]
        difficulty_list = ["쉬움", "보통", "어려움"]

        result = ""
        used_keywords = ""
        # used_keywords는 반복문 밖에서 초기화하지 않고, 매번 새로운 값으로 설정
        for i in range(num_questions):
            # 가중치를 적용하여 난이도 선택
            # difficulty = random.choices(difficulties, weights=weights, k=1)[0]
            quiz_prompt = await create_prompt_template()
            llm = ChatOpenAI(
                model_name="gpt-4o-mini",
                temperature=0.3)

            """
            claude-3-haiku-20240307
            claude-3-5-sonnet-20240620
            """
            #llm = ChatAnthropic(
                #model="claude-3-5-sonnet-20240620",
                #temperature=0.2,
            #)
            quiz_chain = (
                RunnableParallel(
                    context=RunnablePassthrough(),
                    keywords=RunnablePassthrough(),
                    used_keywords=RunnablePassthrough(),
                    used_questions=RunnablePassthrough(),
                    subject=RunnablePassthrough(),
                    num_questions=RunnablePassthrough(),
                    choice_count=RunnablePassthrough(),
                    user_difficulty_choice=RunnablePassthrough(),
                    question=RunnablePassthrough(),
                    answer_list=RunnablePassthrough()
                )
                | quiz_prompt
                | llm
                | StrOutputParser()
                )
            question = f"""
                        {subject}와 관련된 문제를 다음과 같은 키워드 :  {', '.join(keywords[i])} 에 맞게 생성하고 문제 선택지 개수는 {choice_count}개를 맞춰줘
                        **5문제 중 최소 3문제 이상은 {difficulty_list[user_difficulty_choice-1]}로 설정해야 합니다.**
                        """
            # 각 퀴즈 생성 시마다 사용된 키워드가 포함된 새 used_keywords 값

            input_data = {
                "context":retriever,
                "keywords": ', '.join(keywords[i]),
                "used_keywords": used_keywords,
                "used_questions":used_questions,
                "subject": subject,
                "num_questions":num_questions,
                "question": question,
                "choice_count":choice_count,
                "user_difficulty_choice":user_difficulty_choice,
                "question":question,
                "answer_list": ', '.join(map(str, answer_list))
            }

            #quiz_chain 실행
            result = await asyncio.to_thread(quiz_chain.invoke, input_data)
            questions = result.strip().split("\n\n")
            random.shuffle(questions)

            result = "\n\n".join(questions)
            used_questions = used_questions + ', '.join(re.findall(pattern, result))

            used_keywords = used_keywords + ', '.join(keywords[i])
            # Kafka로 퀴즈 및 추가 정보를 전송 (JSON 직렬화 후 UTF-8 인코딩, ensure_ascii=False 추가)
            quiz_data = {
                'user_idx': user_idx,
                'email': email,
                'index_path': index_path,
                'required_quiz_count': required_quiz_count,
                'current_quiz_number': (i+1)*5,

                'question': result.strip()
            }
            # Kafka 메시지 전송을 비동기적으로 처리
            await asyncio.to_thread(producer.produce, 'quiz_topic', json.dumps(quiz_data, ensure_ascii=False).encode('utf-8'))

        await asyncio.to_thread(producer.flush)
        return {"status": "Quizzes sent to Kafka"}
    except Exception as e:
        raise e