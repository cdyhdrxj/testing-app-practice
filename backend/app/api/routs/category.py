from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy import select

from models.category import Category
from schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from api.deps import SessionDep
from general.permission_checker import PermissionChecker

router = APIRouter(
    prefix="/categories",
    tags=["Категории тестов"],
)

@router.post("/", response_model=CategoryRead)
def create_category(
    category: CategoryCreate,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    category_db = Category(name=category.name)
    session.add(category_db)
    session.commit()
    session.refresh(category_db)
    return category_db


@router.get("/", response_model=list[CategoryRead])
def read_categories(
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(Category)
    categories = session.scalars(stmt).all()
    return categories


@router.get("/{category_id}", response_model=CategoryRead)
def read_category(
    category_id: int,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(Category).where(Category.id == category_id)
    category_db = session.scalar(stmt)

    if not category_db :
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена")

    return CategoryRead.model_validate(category_db)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(Category).where(Category.id == category_id)
    category_db = session.scalar(stmt)

    if not category_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена")

    category_data = category.model_dump(exclude_unset=True)
    for field, value in category_data.items():
        setattr(category_db, field, value)

    session.commit()
    session.refresh(category_db)
    return category_db


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(Category).where(Category.id == category_id)
    category_db = session.scalar(stmt)

    if not category_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена")

    session.delete(category_db)
    session.commit()
    return {"ok": True}
