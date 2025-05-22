import os
import tempfile
from datetime import datetime
from fastapi import UploadFile
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import  OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv(dotenv_path="src/.env")


async def file_to_document(file: UploadFile) -> PyMuPDFLoader:
    try:
        # 임시 파일 생성
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            # UploadFile의 내용을 임시 파일에 쓰기
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # PyMuPDFLoader를 사용하여 임시 파일 로드
        loader = PyMuPDFLoader(temp_file_path)
        documents = loader.load()

        # 임시 파일 삭제
        os.unlink(temp_file_path)

        return documents
    except Exception as e:
        raise Exception(f"{file_to_document.__name__} function raise exception about: {str(e)}")

async def chunk_text(
    documents,
    chunk_size=512,
    overlap=200
    ) -> CharacterTextSplitter:
    try:
        text_splitter = CharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)
        return text_splitter.split_documents(documents)
    except(Exception) as e:
        raise Exception(f"{chunk_text.__name__} function raise exception about :{str(e)}")

async def text_to_embedding() -> OpenAIEmbeddings:
    try:
        embeddings = OpenAIEmbeddings()
        #-- 청크 단위 텍스트를 임베딩으로 변환
        return embeddings
    except(Exception) as e:
        raise Exception(f"{text_to_embedding.__name__} function raise exception about :{str(e)}")

async def save_vector_to_faiss(docs, embeddings, filename):
    try:
        db = await FAISS.afrom_documents(docs, embeddings)

        # 고유한 인덱스 경로 생성
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        index_name = f"{os.path.splitext(filename)[0]}_{timestamp}"
        index_path = os.path.join("faiss_indexes", index_name)

        # 디렉토리가 존재하지 않으면 생성
        os.makedirs(os.path.dirname(index_path), exist_ok=True)

        db.save_local(index_path)
        return index_path
    except Exception as e:
        raise Exception(f"Error in save_vector_to_faiss: {str(e)}")