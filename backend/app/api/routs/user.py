from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy import select

from models.user import User
from schemas.user import UserCreate, UserRead
from api.deps import SessionDep
from general.password import get_password_hash
from general.auth import get_current_active_user
from general.permission_checker import PermissionChecker


router = APIRouter(
    prefix="/users",
    tags=["Пользователи"],
)

@router.post("/", response_model=UserRead)
def create_user(
    user: UserCreate,
    session: SessionDep,
):
    user_db = User(
        name=user.name,
        is_admin=False,
        is_blocked=False,
        password_hash=get_password_hash(user.password)
    )
    
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db


@router.post("/admin", response_model=UserRead)
def create_admin(
    user: UserCreate,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    user_db = User(
        name=user.name,
        is_admin=True,
        is_blocked=False,
        password_hash=get_password_hash(user.password)
    )
    
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db


@router.get("/", response_model=list[UserRead])
def read_users(
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(User)
    users = session.scalars(stmt).all()
    return users


@router.get("/{user_id}", response_model=UserRead)
def read_user(
    user_id: int,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(User).where(User.id == user_id)
    user_db = session.scalar(stmt)
    
    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    return UserRead.model_validate(user_db)


@router.post("/{user_id}", response_model=UserRead)
def block_or_unblock_user(
    user_id: int,
    session: SessionDep,
    current_user: UserRead = Depends(get_current_active_user),
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(User).where(User.id == user_id)
    user_db = session.scalar(stmt)
    
    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нельзя заблокировать свой аккаунт")

    user_db.is_blocked = not user_db.is_blocked
    session.commit()
    session.refresh(user_db)

    return UserRead.model_validate(user_db)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    session: SessionDep,
    current_user: UserRead = Depends(get_current_active_user),
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(User).where(User.id == user_id)
    user_db = session.scalar(stmt)

    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нельзя удалить свой аккаунт")

    session.delete(user_db)
    session.commit()
    return {"ok": True}
