from fastapi import Depends, HTTPException, status, Cookie, Response
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone
from typing import Annotated
from enum import Enum
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from pydantic import BaseModel

from schemas.user import UserRead, UserToken
from general.user import read_user_by_name
from api.deps import SessionDep

SECRET_KEY = "36979beb55696b6bc0ecd085250991c8ea677d9c20f4792f3d30da7f6b84fb71"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class T(str, Enum):
    NAME = "sub"
    IS_ADMIN = "admin"
    TIME_EXPIRE = "exp"

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    name: str | None = None
    is_admin: bool | None = None

def create_access_token(user: UserToken, expires_delta: timedelta) -> str:
    to_encode = {
        T.NAME: user.name,
        T.IS_ADMIN: user.is_admin,
        T.TIME_EXPIRE: datetime.now(timezone.utc) + expires_delta
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    session: SessionDep,
    response: Response,
    access_token: str = Cookie(None),
) -> UserRead:
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Необходимо войти в аккаунт",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Недействительные учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        name = payload.get(T.NAME)
        is_admin = payload.get(T.IS_ADMIN)

        if name is None or is_admin is None:
            delete_cookie(response)
            raise credentials_exception
        token_data = TokenData(name=name, is_admin=is_admin)
    except [ExpiredSignatureError, InvalidTokenError]:
        delete_cookie(response)
        raise credentials_exception

    user = read_user_by_name(token_data.name, session)
    if user is None or user.is_admin != token_data.is_admin or user.is_blocked:
        delete_cookie(response)
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: Annotated[UserRead, Depends(get_current_user)]
) -> UserRead:
    return current_user


def delete_cookie(response: Response):
    response.delete_cookie(
        key="is_admin",
        httponly=True,
        secure=True,
        path="/",
    )

    response.delete_cookie(
        key="client_is_admin",
        secure=True,
        path="/",
    )

    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        path="/",
    )
