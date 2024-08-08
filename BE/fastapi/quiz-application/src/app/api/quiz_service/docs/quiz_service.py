desc_create_quiz = """
* ***Description***:\n
    * 주어진 인덱스 경로와 문제 수를 바탕으로 퀴즈를 생성하는 API

* ***Request Parameters***:\n
    * index_path: 벡터 저장소의 인덱스 경로 (필수)
    * num_questions: 생성할 문제의 수 (필수)

* ***Request Body***:\n
    * `application/json` 형식
    * 예시:
        ```json
        {
            "index_path": "path/to/saved/index",
            "num_questions": 5
        }
        ```

* ***Response (Success)***:\n
    * HTTP 200
        * Json 타입 반환
            - {
                "message": "Quiz generation successful!",
                "quiz": "생성된 퀴즈 텍스트"
              }

* ***Response (Bad Request)***:\n
    * HTTP 400
        * Json 타입 반환
            - {'message': 'Invalid input parameters. Please check the index_path and num_questions.'}

* ***Response (Internal Server Error)***:\n
    * HTTP 500
        * Json 타입 반환
            - {
                "message": "퀴즈 생성 중 오류 발생.",
                "detail": "퀴즈 생성 중 오류 발생: <exception_message>"
              }

* ***Function Details***:
    * `generate_quiz(index_path: str, num_questions: int)`: 주어진 인덱스 경로에서 벡터를 로드하여 문서 요약, 키워드 추출 및 퀴즈 생성을 수행합니다.
        - **Steps**:
            1. **벡터 로드**: 주어진 인덱스 경로에서 벡터를 로드합니다.
            2. **문서 요약**: 로드된 문서에서 요약을 생성합니다.
            3. **키워드 추출**: 요약에서 중요한 키워드를 추출합니다.
            4. **퀴즈 생성**: 요약과 키워드를 바탕으로 객관식 문제를 생성합니다.
        - **Return**: 생성된 퀴즈 텍스트를 반환합니다.

    * `validate_quiz(quiz_text, num_questions, context)`: 생성된 퀴즈가 요청된 문제 수와 형식을 만족하는지 검증합니다.
        - **Steps**:
            1. **문제 수 검증**: 생성된 문제가 요청된 문제 수와 일치하는지 확인합니다.
            2. **형식 검증**: 각 문제가 올바른 형식을 따르고 있는지 확인합니다.
            3. **설명 검증**: 각 문제의 설명이 주어진 내용을 참조하는지 확인합니다.
        - **Return**: 검증된 퀴즈 텍스트를 반환합니다.

"""