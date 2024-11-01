import asyncio
import json
import random
import re
import time

from aiokafka import AIOKafkaProducer
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate
from langchain_anthropic import ChatAnthropic
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from asyncio import Queue, Semaphore
from dataclasses import dataclass
from typing import List, Set

@dataclass
class QuizState:
    used_questions: Set[str] | None = None
    used_keywords: Set[str] | None = None
    current_question_number: int = 0

    def __init__(self):
        self.used_questions = set()
        self.used_keywords = set()
        self.current_question_number = 0

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
            주어진 문서의 내용을 분석하여 가장 핵심적이고 포괄적인 주제 1개를 선정해주세요.

            다음 기준을 고려하여 선정해주세요:
            1. 문서의 전체 내용을 포괄하는 상위 개념의 주제여야 합니다.
            2. 해당 분야의 전반적인 내용을 아우를 수 있어야 합니다.
            3. 세부 주제들을 포함할 수 있는 충분히 넓은 범위여야 합니다.
            4. 문서의 핵심 개념들을 포괄적으로 설명할 수 있어야 합니다.
            5. 교육적 관점에서 체계적인 학습이 가능한 주제여야 합니다.

            주제는 2-4개 단어로 구성된 명확한 구문으로 작성해주세요.
            예시:
            "소프트웨어 공학"
            "데이터베이스 시스템"
            "인공지능과 머신러닝"
            "디지털 마케팅 전략"

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
        question = "해당 문서의 핵심 주제는?"
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
            model=model_name,
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
    # summary,
    subject,
    retriever,
    num_questions=5,
    num_keywords =5
):
    try:
        total_keyword = num_questions * num_keywords
        keyword_prompt = PromptTemplate.from_template(
            template="""
        주어진 문서의 내용을 바탕으로 가장 중요하고 관련성 높은 {n}개의 키워드를 추출해 주시기 바랍니다. 추출 시 다음 지침을 준수해 주시면 감사하겠습니다:
        1. 키워드는 문서의 주제와 직접적으로 연관된 핵심 개념과 중요 용어를 대표해야 합니다.
        2. 각 키워드는 유일해야 하며, 개념적으로 비슷한 키워드는 하나의 대표 키워드로 통합해 주십시오.
        3. 단일 단어뿐만 아니라 짧은 구문도 포함될 수 있으나, 문제 출제에 적합한 형태로 선정해 주십시오.
        4. 키워드는 문서의 주요 챕터나 섹션별로 균형있게 분포되도록 선택해 주시기 바랍니다.
        5. 다음 우선순위로 키워드를 선정해 주십시오:
           - 문서에서 반복적으로 등장하는 핵심 개념
           - 해당 분야의 전문 용어나 기술적 용어
           - 정의나 설명이 필요한 중요 개념
           - 다른 개념과의 관계성이 높은 용어
        6. 각 키워드는 문제 출제가 가능한 수준의 구체성을 가져야 합니다.
        7. 키워드는 난이도(상/중/하)를 고려하여 다양하게 선정해 주십시오.
        8. 키워드는 중요도 순으로 정렬하되, 연관된 개념들이 인접하도록 배치해 주십시오.
        9. 각 키워드는 쉼표로 구분하고, 마지막에는 마침표를 찍지 말아 주십시오.
        10. 선정된 키워드들은 객관식, 주관식, 서술형 등 다양한 유형의 문제 출제가 가능해야 합니다.


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
            "subject": subject,
            "n": total_keyword,
            "question": question
        }

        # keyword_chain 실행
        keywords = await keyword_chain.ainvoke(input_data)
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

            1. 주어진 주제와 context를 바탕으로 keywords에 해당하는 핵심 개념을 활용하여 객관식 문제 5개를 생성해 주십시오.

            2. 문제 유형 다양화:
               - "다음 중 ~한 것은 무엇인가요?"
               - "다음 설명 중 옳은 것을 고르시오."
               - "다음 설명 중 틀린 것을 고르시오."
               - "다음 중 ~의 주요 특징이 아닌 것은?"
               - "~에 대한 설명으로 가장 적절한 것은?"
               - "다음 보기 중 ~와 가장 관련이 깊은 것은?"
               - "~의 핵심 개념을 가장 잘 설명한 것은?"
               - "다음 중 ~의 올바른 순서는?"
               각 문제마다 다른 유형의 질문 형식을 사용하여 다양성을 확보하세요.

            3. 난이도별 문제 구성 방법:
               - 쉬움: 1-2개의 키워드를 사용하여 기본 개념 이해도를 측정
               - 보통: 2-3개의 키워드를 조합하여 개념 간의 관계 이해도를 측정
               - 어려움: 3개 이상의 키워드를 복합적으로 활용하여 심화 개념과 응용력을 측정

            4. 키워드 사용 규칙:
               - 키워드는 제공된 형태 그대로 사용해야 합니다 (분리하거나 변형하지 마세요)
               - 각 문제는 난이도에 맞는 수의 키워드를 반드시 포함해야 합니다
               - 키워드 목록에서 연관된 키워드들을 조합하여 사용하세요
               - 키워드는 문제의 핵심 개념으로 활용되어야 합니다

            5. 문제 생성 시 중복 방지:
               - {used_questions}에 포함된 문제와 유사하거나 동일한 문제는 절대 생성하지 마세요
               - {used_keywords}와 관련된 개념은 새로운 관점에서만 다루어야 합니다
               - 각 문제는 서로 다른 개념을 다뤄야 합니다

            6. 선택지 구성:
               - {choice_count}개의 선택지를 제공하되, 1번부터 {choice_count}번까지 번호를 매깁니다
               - 정답은 {answer_list} 중에서 선택하며, 정답 번호가 균등하게 분포되어야 합니다
               - 오답은 정답과 유사하지만 명확히 구분되는 내용으로 구성합니다

            7. 난이도 조정:
               - 전체 난이도는 {user_difficulty_choice}을 기준으로 합니다
               - 문제 세트 내에서도 난이도를 점진적으로 높여가며 구성합니다

            8. 설명 작성:
               - 각 정답에 대해 context와 keywords를 직접 인용한 명확한 설명을 제공합니다
               - 설명은 학습자가 개념을 정확히 이해할 수 있도록 구체적이어야 합니다

            9. 형식 요구사항:
               - 문단 구분을 위한 특수문자(###등)는 사용하지 않습니다
               - 아래 제시된 형식을 정확히 따라주세요
               - 형식 외의 추가 답변이나 설명은 하지 마세요

            #주제
            주제: {subject}

            #사용된 문제
            사용된 문제: {used_questions}

            #context
            context: {context}

            #keywords
            keywords: {keywords}

            #answer_list
            answer_list: {answer_list}

            다음 형식으로 문제를 작성해주세요:

            난이도: [쉬움/보통/어려움]
            키워드: [사용된 키워드들을 쉼표로 구분하여 나열]
            문제: [문제 내용]
            1) [선택지 1]
            2) [선택지 2]
            ...
            {choice_count}) [선택지 {choice_count}]
            정답: [정답 번호]
            설명: [context 기반 상세 설명]
            """
        )
    except Exception as e:
        raise e

async def generate_and_send_quiz(
    producer: AIOKafkaProducer,
    llm,
    retriever,
    keywords: List[str],
    subject: str,
    user_idx: int,
    email: str,
    index_path: str,
    required_quiz_count: int,
    user_difficulty_choice: int,
    choice_count: int,
    batch_index: int,
    difficulty_list: List[str],
    answer_list: List[int],
    quiz_state: QuizState,
    state_lock: Semaphore,
    result_queue: Queue
):
    try:
        quiz_prompt = await create_prompt_template()
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

        # 현재 배치의 키워드 가져오기
        batch_keywords = keywords[batch_index]

        # 상태 동기화를 위한 락 획득
        async with state_lock:
            current_used_keywords = ', '.join(quiz_state.used_keywords)
            current_used_questions = ', '.join(quiz_state.used_questions)
            current_question_number = quiz_state.current_question_number + 5
            quiz_state.current_question_number = current_question_number

        # 난이도별 문제 수 계산
        difficulty_distribution = {
            "쉬움": 1,
            "보통": 2,
            "어려움": 2
        }
        if user_difficulty_choice == 1:  # 쉬움
            difficulty_distribution = {
                "쉬움": 3,
                "보통": 1,
                "어려움": 1
            }
        elif user_difficulty_choice == 2:  # 보통
            difficulty_distribution = {
                "쉬움": 1,
                "보통": 3,
                "어려움": 1
            }
        elif user_difficulty_choice == 3:  # 어려움
            difficulty_distribution = {
                "쉬움": 1,
                "보통": 1,
                "어려움": 3
            }

        question = f"""
            {subject}와 관련된 문제를 다음과 같은 키워드 : {', '.join(batch_keywords)} 에 맞게 생성하고
            문제 선택지 개수는 {choice_count}개를 맞춰줘
            이전에 사용된 키워드({current_used_keywords})와 중복되지 않도록 해주세요.
            이전에 생성된 문제({current_used_questions})와 유사하지 않도록 해주세요.

            다음과 같은 난이도 분포로 문제를 생성해주세요:
            - 쉬움: {difficulty_distribution['쉬움']}문제
            - 보통: {difficulty_distribution['보통']}문제
            - 어려움: {difficulty_distribution['어려움']}문제
            """

        input_data = {
            "context": retriever,
            "keywords": ', '.join(batch_keywords),
            "used_keywords": current_used_keywords,
            "used_questions": current_used_questions,
            "subject": subject,
            "num_questions": 1,
            "question": question,
            "choice_count": choice_count,
            "user_difficulty_choice": user_difficulty_choice,
            "answer_list": ', '.join(map(str, answer_list))
        }

        result = await asyncio.to_thread(quiz_chain.invoke, input_data)
        questions = result.strip().split("\n\n")
        random.shuffle(questions)
        result = "\n\n".join(questions)

        # 새로운 문제와 키워드 추출
        new_questions = set(re.findall(r"문제:\s(.*?)\s\n", result))
        new_keywords = set(re.findall(r"키워드:\s(.*?)\s\n", result))

        # 상태 업데이트를 위한 락 획득
        async with state_lock:
            quiz_state.used_questions.update(new_questions)
            quiz_state.used_keywords.update(new_keywords)

        # 키워드 패턴 제거
        result = re.sub(r"키워드:\s(.*?)\s\n", '', result)

        # 난이도별로 문제 분류
        difficulty_questions = {
            "쉬움": [],
            "보통": [],
            "어려움": []
        }

        for q in questions:
            difficulty = re.search(r"난이도:\s*(쉬움|보통|어려움)", q)
            if difficulty:
                diff = difficulty.group(1)
                difficulty_questions[diff].append(q)

        # 난이도 분포에 맞게 문제 재구성
        final_questions = []
        for diff, count in difficulty_distribution.items():
            available = difficulty_questions[diff]
            selected = available[:count]
            if len(selected) < count:
                # 부족한 문제는 다른 난이도에서 보충
                remaining = count - len(selected)
                for other_diff in ["보통", "쉬움", "어려움"]:
                    if other_diff != diff and remaining > 0:
                        available_others = difficulty_questions[other_diff]
                        selected.extend(available_others[:remaining])
                        remaining -= len(available_others[:remaining])
            final_questions.extend(selected)

        random.shuffle(final_questions)
        result = "\n\n".join(final_questions)

        quiz_data = {
            'user_idx': user_idx,
            'email': email,
            'index_path': index_path,
            'required_quiz_count': required_quiz_count,
            'current_quiz_number': current_question_number,
            'question': result.strip()
        }

        json_data = json.dumps(quiz_data, ensure_ascii=False)
        await producer.send_and_wait('quiz_topic', json_data.encode('utf-8'))

        # 결과를 큐에 저장
        await result_queue.put((batch_index, True))
        return True

    except Exception as e:
        print(f"Error in generate_and_send_quiz: {e}")
        await result_queue.put((batch_index, False))
        return False

async def make_quiz(
    llm,
    retriever,
    keywords,
    subject,
    user_idx,
    email,
    index_path,
    user_difficulty_choice,
    num_questions=5,
    choice_count=4,
):
    producer = None
    try:
        producer = AIOKafkaProducer(bootstrap_servers='localhost:9092')
        await producer.start()

        required_quiz_count = num_questions
        batch_size = 5  # 배치당 키워드 개수 설정
        num_batches = num_questions // batch_size  # 총 배치 수 계산

        # keywords를 배치 크기에 맞게 재구성
        batched_keywords = []
        for i in range(0, len(keywords), batch_size):
            batch = keywords[i:i + batch_size]
            batched_keywords.append(batch)

        answer_list = [1, 2, 3, 4, 5]
        difficulty_list = ["쉬움", "보통", "어려움"]

        # 공유 상태 객체 생성
        quiz_state = QuizState()
        state_lock = Semaphore()
        result_queue = Queue()

        # 각 배치별로 태스크 생성
        tasks = [
            generate_and_send_quiz(
                producer,
                llm,
                retriever,
                batched_keywords,  # 배치로 구성된 키워드 리스트 전달
                subject,
                user_idx,
                email,
                index_path,
                required_quiz_count,
                user_difficulty_choice,
                choice_count,
                i,
                difficulty_list,
                answer_list,
                quiz_state,
                state_lock,
                result_queue
            )
            for i in range(num_batches)
        ]

        # 모든 태스크 실행
        await asyncio.gather(*tasks)

        # 결과 수집 및 확인
        results = []
        for _ in range(num_batches):
            batch_index, success = await result_queue.get()
            results.append((batch_index, success))

        # 결과 정렬 및 성공 여부 확인
        results.sort(key=lambda x: x[0])
        all_successful = all(success for _, success in results)

        await producer.stop()

        if all_successful:
            return {"status": "All quizzes successfully sent to Kafka"}
        else:
            failed_batches = [idx for idx, success in results if not success]
            return {
                "status": "Some quizzes failed to generate or send",
                "failed_batches": failed_batches
            }

    except Exception as e:
        if producer:
            await producer.stop()
        raise e
