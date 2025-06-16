from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Answer(Base):
    """Модель варианта ответа"""
    __tablename__ = 'answers'
    
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.id', ondelete="CASCADE"), nullable=False)
    text = Column(String(1000), nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    
    question = relationship("Question", back_populates="answers")
