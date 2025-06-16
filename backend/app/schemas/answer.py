from pydantic import BaseModel, Field

class AnswerBase(BaseModel):
    text: str
    class Config:
        from_attributes = True

class AnswerRead(AnswerBase):
    id: int

class AnswerReadWithCorrect(AnswerRead):
    is_correct: bool

class AnswerCreate(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    is_correct: bool

class AnswerUpdate(AnswerCreate):
    id: int | None = None

class AnswerCheck(AnswerBase):
    id: int
    text: str | None = Field(default=None, max_length=1000)
