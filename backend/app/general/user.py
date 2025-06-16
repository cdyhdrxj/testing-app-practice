from sqlalchemy import select
from models.user import User
from schemas.user import UserLogin
from api.deps import SessionDep

def read_user_by_name(name: str, session: SessionDep) -> UserLogin:
    user = session.scalar(select(User).where(User.name == name))
    return user if user else None
