from sqlalchemy import Column, Integer, String, ForeignKey, SmallInteger
from sqlalchemy.orm import relationship
from db import Base

class Question(Base):
    """Модель вопроса теста"""
    __tablename__ = 'questions'
    
    id = Column(Integer, primary_key=True)
    text = Column(String(1000), nullable=False)
    test_id = Column(Integer, ForeignKey('tests.id', ondelete="CASCADE"), nullable=False)
    type = Column(SmallInteger, nullable=False)
    
    test = relationship("Test", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan", passive_deletes=True)
