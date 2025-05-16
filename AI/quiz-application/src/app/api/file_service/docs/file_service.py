desc_pdf_upload ="""
* ***Description***:\n
    * PDF 파일을 업로드하여 벡터 DB에 저장하는 API

* ***Request Parameters***:\n
    * file: 업로드할 PDF 파일 (필수)

* ***Request Body***:\n
    * multipart/form-data 형식의 `application/pdf` 파일

* ***Response (Success)***:\n
    * HTTP 200
        * Json 타입 반환
            - {
                "message": "PDF upload successful !!",
                "index_path": "path/to/saved/index"
              }

* ***Response (Bad Request)***:\n
    * HTTP 400
        * Json 타입 반환
            - {'message': 'Invalid file format. Please upload a PDF file.'}

* ***Response (Internal Server Error)***:\n
    * HTTP 500
        * Json 타입 반환
            - {
                "message": "An error occurred while processing the file. Please try again later.",
                "detail": "save_pdf_to_faiss function raise exception about: <exception_message>"
            }
"""
