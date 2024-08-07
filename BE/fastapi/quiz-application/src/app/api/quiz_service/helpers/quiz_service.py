from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
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

from langchain.prompts import PromptTemplate

def create_template():
    template = """
    Based on the following context, create {num_questions} multiple-choice questions. 
    Each question should have 4 options (A, B, C, D) with only one correct answer.
    Format your response as follows for each question:

    Question: [Question text]
    A) [Option A]
    B) [Option B]
    C) [Option C]
    D) [Option D]
    Correct Answer: [Correct option letter]

    Context: {context}
    """
    return PromptTemplate(
        input_variables=["context", "num_questions"],
        template=template
    )