from fastapi import APIRouter, Depends, HTTPException, status, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Annotated

from schemas.user import UserRead
from general.auth import get_current_active_user, create_access_token, delete_cookie, ACCESS_TOKEN_EXPIRE_MINUTES
from general.password import verify_password
from general.user import read_user_by_name
from general.permission_checker import PermissionChecker
from api.deps import SessionDep


router = APIRouter(
    tags=["Аутентификация"],
)

@router.post("/login", response_model=UserRead)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
    response: Response,
):
    user = read_user_by_name(form_data.username, session)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Некорректный логин или пароль",
        )
    
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Пользователь заблокирован",
        )
 
    access_token = create_access_token(user, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    response.set_cookie(
        key="is_admin",
        value=user.is_admin,
        httponly=True,
        secure=True,
        max_age=30 * 60,  # 0.5 часа
        path="/",
    )

    response.set_cookie(
        key="client_is_admin",
        value=user.is_admin,
        httponly=False,
        secure=True,
        max_age=30 * 60,  # 0.5 часа
        path="/",
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        max_age=30 * 60,  # 0.5 часа
        path="/",
    )
    
    return user


@router.post("/logout")
def logout(response: Response):
   delete_cookie(response)
   return {"ok": True}


@router.get("/me", response_model=UserRead)
def read_users_me(
    current_user: Annotated[UserRead, Depends(get_current_active_user)],
    authorize: bool = Depends(PermissionChecker())
):
    return current_user
