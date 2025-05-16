import os

from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# 환경 변수에서 OPENAI_API_KEY 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DB_INDEX = os.getenv('MY_ASYNC_DB_INDEX')