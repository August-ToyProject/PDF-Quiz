from pydantic import BaseModel

class QuizRequest(BaseModel):
    user_idx:int
    email:str
    index_path: str
    subject: str
    keywords: list[str]
    num_questions: int = 5
    choice_count:int = 5
    difficulty:int = 1
