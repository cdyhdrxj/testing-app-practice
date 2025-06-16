from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db import Base

class Category(Base):
    """Модель категории тестов"""
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    
    tests = relationship("Test", back_populates="category")
