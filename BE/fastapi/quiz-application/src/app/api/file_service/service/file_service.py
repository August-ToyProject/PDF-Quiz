from fastapi import File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from langchain_openai import ChatOpenAI
from langchain_teddynote.retrievers import KiwiBM25Retriever
from src.app.api.file_service.helpers.file_service import (
    file_to_document,
    chunk_text,
    text_to_embedding,
    save_vector_to_faiss
)
from src.app.api.quiz_service.helpers.quiz_service import (
    get_keyword_from_summary,
    get_subject_from_summary_docs,
    load_vector
)

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

        #-- step5. 문서 분석을 위한 retriever 생성
        vector_store = await load_vector(index_path)
        docs = vector_store.similarity_search("", k=10)
        retriever = KiwiBM25Retriever.from_documents(docs)

        #-- step6. LLM 초기화
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.2
        )

        #-- step7. 주제 추출
        subject = await get_subject_from_summary_docs(llm, retriever)

        #-- step8. 키워드 추출
        keywords = await get_keyword_from_summary(
            llm=llm,
            retriever=retriever,
            subject=subject,
            num_questions=5,
            num_keywords=5
        )

        return JSONResponse(content={
            "message": "PDF upload successful !!",
            "index_path": index_path,
            "subject": subject,
            "keywords": keywords
        })

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"{save_pdf_to_faiss.__name__} function raise exception about: {str(e)}"
        )