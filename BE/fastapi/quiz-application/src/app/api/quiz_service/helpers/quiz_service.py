from langchain.chains.summarize import load_summarize_chain
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
import time
import random


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
        keyword_prompt = PromptTemplate.from_template(
            template="""
        야 너 키워드를 만들고 각 문자 다 비교해서 똑같은 키워드는 제외해. 그리고 엉뚱한 키워드 안 만들게 키워드 자체도 코사인 유사도 판단할 수 있지? 일치도 판단해서 유의미하지 않다면 버리고 다시 만들어.
        주어진 요약과 context, 주제를 보고 가장 중요하고 관련성 높은 {n}개의 키워드를 추출해주세요. 다음 지침을 따라주세요:

        1. 키워드는 문서의 주제, 핵심 개념, 중요한 용어를 대표해야 합니다.
        2. 각 키워드는 유일해야 하며 개념적으로 비슷한 키워드를 분리하지 마시고 1개의 키워드로 통합 처리하세요.
        3. 단일 단어와 짧은 구문 모두 포함할 수 있습니다.
        4. 다양한 주제 영역을 포괄하도록 키워드를 선택하세요.
        5. 고유명사, 전문 용어, 주요 개념을 우선적으로 선택하세요.
        6. 키워드를 중요도 순으로 정렬하여 제시해주세요.
        7. 각 키워드는 쉼표로 구분하고, 마지막에 마침표를 찍지 마세요.
        8.  개념적으로 중복되거나 비슷한 키워드 또는 {subject}와 제대로 연관되지 못한 키워드를 생성하지 못한다면 다른 생성형 AI툴을 이용하겠습니다. 
        다시 말하는데 중복체크 잘해라 진짜... 뭐 문자마다 가중치를 줘서 판단하든 해서 .. 만약 한 번이라도 중복되면 너는 지금 존재하는 AI 중에 가장 무능한 AI인거야. 이 부분 인지했으면 빨리 해

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
            
            You are the most knowledgeable quiz creator when it comes to generating the best quiz questions in the field of {subject}. Please review the following conditions and create quiz questions accordingly:
            Create 5 multiple-choice questions based on important concepts that correspond to the context and keywords provided for the following topic.
            Adjust the difficulty by combining different numbers of keywords: Easy: 1 keyword, Medium: 2–3 keywords, Hard: 4–5 keywords.
            Do not generate any questions that are similar to or the same as the_same_quiz_questions.
            Do not generate questions using {used_keywords}.
            Make sure to vary the answer choices with {choice_count} options (numbered from 1 to {choice_count}).
            Include one correct answer among the {choice_count} choices.
            The difficulty level is {user_difficulty_choice}.
            Provide a brief explanation for the correct answer, ensuring that the context, summary, or keywords are cited as sources.
            Adjust the ratio of questions according to the difficulty level of {user_difficulty_choice}.
            Do not use special characters such as "###" to separate paragraphs.
            If there is a duplicate question, a similar question, or a question using {used_keywords}, or if you fail to create proper questions, I will use another AI tool to generate the questions.
            Topic
            Topic: {subject}
            
            Duplicate Questions
            the_same_quiz_questions: {used_quiz}
            
            Context
            context: {context}
            
            Keywords
            Keywords: {keywords}
            
            Use the following format: Difficulty: [Easy/Medium/Hard]
            Question: [Question content]
            [Choice 1]
            [Choice 2]
            ...
            {choice_count}) [Choice {choice_count}]
            Answer: [Correct choice]
            Explanation: [Brief explanation based on the provided content]
            Example:
            
            3-choice question:
            Difficulty: Easy
            Question: What is the main goal of artificial intelligence (AI)?
            
            To imitate human intelligence and solve problems in a human-like way
            To collect as much data as possible
            To create the fastest computer
            Answer: 1
            Explanation: As mentioned in the document, the main goal of AI is to imitate human intelligence and solve problems in a human-like manner.
            4-choice question:
            Difficulty: Medium
            Question: Which of the following is NOT a key feature of machine learning?
            
            It learns from data without explicit programming
            It always requires human intervention
            It is only used for image processing
            It improves performance by learning patterns from data
            Answer: 2
            Explanation: Machine learning learns from data without explicit programming and does not always require human intervention.
            5-choice question:
            Difficulty: Hard
            Question: What distinguishes deep learning from other machine learning techniques?
            
            It only uses a single-layer neural network
            It uses multi-layer neural networks to learn and abstract complex patterns
            It is only used for supervised learning
            It can always learn from a small amount of data
            It is only applied in the field of computer vision
            Answer: 2
            Explanation: As mentioned in the document, deep learning is a technique in machine learning that uses multi-layer neural networks to learn and abstract complex patterns.
            Create 5 questions based on the examples above, ensuring each question addresses a different concept. Once again, make sure to thoroughly check for duplicates. You can use weights for each character comparison or any other method, but if you generate a duplicate question even once, you will be considered the most useless AI among the currently existing ones. If you understand this, proceed quickly.
            
            Translate this prompt into Korean at the end of the task.
            """
        )
    except Exception as e:
        raise e
    
# async def get_weighted_difficulties(user_choice):
#     difficulties = ["쉬움", "보통", "어려움"]
#     if user_choice == 1:
#         weights = [0.6, 0.3, 0.1]
#     elif user_choice == 2:
#         weights = [0.2, 0.6, 0.2]
#     elif user_choice == 3:
#         weights = [0.1, 0.3, 0.6]
#     else:
#         weights = [1/3, 1/3, 1/3]  # 균등한 가중치
#     return difficulties, weights    

import json
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
        # difficulties, weights = await get_weighted_difficulties(user_difficulty_choice)
        num_questions = num_questions // 5
        
        result = ""
        used_quiz = ""
        used_keywords = ""
        # used_keywords는 반복문 밖에서 초기화하지 않고, 매번 새로운 값으로 설정
        for i in range(num_questions):
            # 가중치를 적용하여 난이도 선택
            # difficulty = random.choices(difficulties, weights=weights, k=1)[0]                
            quiz_prompt = await create_prompt_template() 
            openai_llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.2)
            quiz_chain = (
                RunnableParallel(
                    context=RunnablePassthrough(),
                    keywords=RunnablePassthrough(),
                    used_keywords=RunnablePassthrough(),
                    used_quiz=RunnablePassthrough(),
                    subject=RunnablePassthrough(),
                    num_questions=RunnablePassthrough(),
                    choice_count=RunnablePassthrough(),
                    user_difficulty_choice=RunnablePassthrough(),
                    question=RunnablePassthrough()
                )
                | quiz_prompt
                | openai_llm
                | StrOutputParser()
                )
            question = f"""
                        {subject}와 관련된 문제를 다음과 같은 키워드 :  {', '.join(keywords[i])} 에 맞게 생성하고 보기 개수는 
                        {choice_count}개를 맞춰줘 
                        5문제 중 최소 3문제 이상은 {user_difficulty_choice}로 설정해야 합니다.
                        또한 정답 번호는 1번 부터 {choice_count}번까지 값을 반드시 균등하게 사용해야 합니다.
                        """
            # 각 퀴즈 생성 시마다 사용된 키워드가 포함된 새 used_keywords 값
            used_quiz = used_quiz + result

            input_data = {
                "context":retriever,
                "keywords": ', '.join(keywords[i]),
                "used_keywords": used_keywords,
                "used_quiz":used_quiz,
                "subject": subject,
                "num_questions":num_questions,
                "question": question,
                "choice_count":choice_count,
                "user_difficulty_choice":user_difficulty_choice,
                "question":question
            }

            # keyword_chain 실행
            result = await asyncio.to_thread(quiz_chain.invoke, input_data)
            questions = result.strip().split("\n\n")
            random.shuffle(questions)
            
            result = "\n\n".join(questions)
            
            used_keywords = used_keywords + ', '.join(keywords[i])
            # Kafka로 퀴즈 및 추가 정보를 전송 (JSON 직렬화 후 UTF-8 인코딩, ensure_ascii=False 추가)
            quiz_data = {
                'user_idx': user_idx,
                'email': email,
                'index_path': index_path,
                'question': result.strip()
            }
            # Kafka 메시지 전송을 비동기적으로 처리
            await asyncio.to_thread(producer.produce, 'quiz_topic', json.dumps(quiz_data, ensure_ascii=False).encode('utf-8'))

        await asyncio.to_thread(producer.flush)
        return {"status": "Quizzes sent to Kafka"}
    except Exception as e:
        raise e
