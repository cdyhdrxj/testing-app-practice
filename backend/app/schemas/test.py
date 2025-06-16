from pydantic import BaseModel, Field
from typing import List
from schemas.category import CategoryRead
from schemas.question import QuestionRead, QuestionReadWithAnswers, QuestionCreate, QuestionUpdate

class TestBase(BaseModel):
    name: str
    class Config:
        from_attributes = True

class TestReadPreview(TestBase):
    id: int
    category: CategoryRead

class TestRead(TestReadPreview):
    id: int
    name: str
    questions: List[QuestionRead]

class TestReadWithAnswers(TestRead):
    questions: List[QuestionReadWithAnswers]

class TestCreate(TestBase):
    name: str = Field(min_length=1, max_length=1000)
    category_id: int
    questions: List[QuestionCreate]

class TestUpdate(TestCreate):
    questions: List[QuestionUpdate]
