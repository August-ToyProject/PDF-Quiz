from typing import List
from fastapi import File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from src.app.api.file_service.helpers.file_service import (
    file_to_document, 
    chunk_text,
    text_to_embedding,
    save_vector_to_faiss
    )

from fastapi import UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

# 기존의 PDFRetrievalChain 클래스를 그대로 활용합니다.
class PDFRetrievalChain:
    def __init__(self, source_uris: List[str], k=5):
        self.source_uris = source_uris
        self.k = k

        self.docs = self.load_documents()
        self.text_splitter = self.create_text_splitter()
        self.split_docs = self.split_documents(self.docs, self.text_splitter)
        self.vectorstore = self.create_vectorstore(self.split_docs)
        self.retriever = self.create_retriever(self.vectorstore)
        self.model = self.create_model()
        self.prompt = self.create_prompt()
        self.chain = self.create_chain()

    def load_documents(self):
        docs = []
        for source_uri in self.source_uris:
            loader = PDFPlumberLoader(source_uri)
            loaded_docs = loader.load()
            if not loaded_docs:  # 문서가 비어 있는지 확인
                raise ValueError(f"Failed to load or extract text from {source_uri}")
            docs.extend(loaded_docs)
        return docs

    def create_text_splitter(self):
        return RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=20)

    def split_documents(self, docs, text_splitter):
        split_docs = text_splitter.split_documents(docs)
        if not split_docs:
            raise ValueError("Text splitting resulted in no chunks.")
        return split_docs

    def create_embedding(self):
        return UpstageEmbeddings(model="solar-embedding-1-large")

    def create_vectorstore(self, split_docs):
        if not split_docs:
            raise ValueError("Cannot create vectorstore with empty documents.")
        return FAISS.from_documents(documents=split_docs, embedding=self.create_embedding())

    def create_retriever(self, vectorstore):
        return vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": self.k})

    def create_model(self):
        return ChatOpenAI(model_name="gpt-4-turbo", temperature=0)

    def create_prompt(self):
        return hub.pull("teddynote/rag-korean-with-source")

    def create_chain(self):
        return (
            {"question": itemgetter("question"), "context": itemgetter("context")}
            | self.prompt
            | self.model
            | StrOutputParser()
        )

    def save_vector_to_faiss(self, filename: str):
        index_path = f"/path/to/save/{filename}.index"
        # FAISS 인덱스 저장 로직이 들어갈 위치
        return index_path

# 비동기 함수에 클래스 적용
async def test_save_pdf_to_faiss(file: UploadFile = File(...)):
    try:
        # Step 1: PDFRetrievalChain을 사용하여 문서 로드
        pdf_retrieval = PDFRetrievalChain(source_uris=[file.filename])
        document = pdf_retrieval.docs

        # Step 2: 텍스트 분할
        docs = pdf_retrieval.split_docs

        # Step 3: 임베딩 생성
        embeddings = pdf_retrieval.create_embedding()

        # Step 4: FAISS에 벡터 저장
        index_path = pdf_retrieval.save_vector_to_faiss(filename=file.filename)
        
        return JSONResponse(content={
            "message": "PDF upload successful !!",
            "index_path": index_path
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{test_save_pdf_to_faiss.__name__} function raise exception about : {str(e)}")


async def save_pdf_to_faiss(
    file: UploadFile = File(...),
    ):
    try:
        #-- step1. document 로더
        document = await file_to_document(file)
        #-- step2. text split 
        docs = await chunk_text(document)        
        #-- step3. word to vector
        embeddings = await text_to_embedding()
        #-- step4. save vector to faiss
        index_path = await save_vector_to_faiss(
            docs=docs,
            embeddings=embeddings,
            filename=file.filename
            )
        return JSONResponse(content={
            "message" : "PDF upload successful !!",
            "index_path" : index_path
        })
        
    except(Exception) as e:
        raise HTTPException(status_code=500, detail= f"{save_pdf_to_faiss.__name__} function raise exception about :{str(e)}")