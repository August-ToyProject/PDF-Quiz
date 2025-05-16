from fastapi import File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from src.app.api.file_service.helpers.file_service import (
    file_to_document, 
    chunk_text,
    text_to_embedding,
    save_vector_to_faiss
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
        return JSONResponse(content={
            "message" : "PDF upload successful !!",
            "index_path" : index_path
        })
        
    except(Exception) as e:
        raise HTTPException(status_code=500, detail= f"{save_pdf_to_faiss.__name__} function raise exception about :{str(e)}")