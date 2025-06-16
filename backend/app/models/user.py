from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.orm import relationship
from db import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(64), unique=True)
    is_admin = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    password_hash = Column(String(128))

    test_results = relationship("TestResult", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
