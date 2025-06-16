from pydantic import BaseModel, Field
from typing import List
from enum import IntEnum
from schemas.answer import AnswerRead, AnswerReadWithCorrect, AnswerCreate, AnswerUpdate, AnswerCheck

class QuestionType(IntEnum):
    SINGLE = 0    # один вариант ответа
    MULTIPLE = 1  # несколько вариантов
    TEXT = 2      # текстовый ответ

class QuestionBase(BaseModel):
    text: str
    class Config:
        from_attributes = True

class QuestionRead(QuestionBase):
    id: int
    type: QuestionType
    answers: List[AnswerRead]

class QuestionReadWithAnswers(QuestionRead):
    answers: List[AnswerReadWithCorrect]

class QuestionCreate(QuestionBase):
    text: str = Field(min_length=1, max_length=1000)
    type: QuestionType
    answers: List[AnswerCreate]

class QuestionUpdate(QuestionCreate):
    id: int | None = None
    answers: List[AnswerUpdate]

class QuestionCheck(BaseModel):
    id: int
    answers: List[AnswerCheck]
