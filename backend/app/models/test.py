from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Test(Base):
    """Модель теста"""
    __tablename__ = 'tests'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(1000), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete="RESTRICT"), nullable=False)

    category = relationship("Category", back_populates="tests")
    questions = relationship("Question", back_populates="test", cascade="all, delete-orphan", passive_deletes=True)
    results = relationship("TestResult", back_populates="test", cascade="all, delete-orphan", passive_deletes=True)
