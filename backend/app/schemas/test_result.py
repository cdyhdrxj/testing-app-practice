from pydantic import BaseModel
from typing import List
from datetime import datetime
from schemas.user import UserRead
from schemas.test import TestReadPreview
from schemas.question import QuestionCheck

class TestResultBase(BaseModel):
    time_start: datetime
    time_end: datetime

    class Config:
        from_attributes = True

class TestResultRead(TestResultBase):
    id: int
    score: int
    full_score: int
    user: UserRead
    test: TestReadPreview

class TestResultCreate(TestResultBase):
    questions: List[QuestionCheck]
