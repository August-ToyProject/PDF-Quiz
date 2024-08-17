from pydantic import BaseModel

class QuizRequest(BaseModel):
    index_path: str
    num_questions: int = 5
    choice_count:int = 4
    difficulty:int = 1