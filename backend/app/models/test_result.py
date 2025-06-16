from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db import Base

class TestResult(Base):
    """Модель результата прохождения теста"""
    __tablename__ = 'test_results'
    
    id = Column(Integer, primary_key=True)
    test_id = Column(Integer, ForeignKey('tests.id', ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    score = Column(Integer, default=0, nullable=False)
    full_score = Column(Integer, nullable=False)
    time_start = Column(DateTime(timezone=True))
    time_end = Column(DateTime(timezone=True))

    test = relationship("Test", back_populates="results")
    user = relationship("User", back_populates="test_results")
