from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload

from models.test import Test
from models.question import Question
from models.answer import Answer
from schemas.test import TestRead, TestReadPreview, TestReadWithAnswers, TestCreate, TestUpdate
from api.deps import SessionDep
from general.permission_checker import PermissionChecker
from general.test import update_test_with_questions

router = APIRouter(
    prefix="/tests",
    tags=["Тесты"],
)

@router.post("/", response_model=TestReadWithAnswers)
def create_test(
    test: TestCreate,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    test_db = Test(
        name=test.name,
        category_id=test.category_id,
        questions=[
            Question(
                text=question.text,
                type=question.type,
                answers=[
                    Answer(
                        text=answer.text,
                        is_correct=answer.is_correct
                    ) for answer in question.answers
                ]
            ) for question in test.questions
        ]
    )

    session.add(test_db)
    session.commit()
    session.refresh(test_db)
    return test_db


@router.get("/", response_model=list[TestReadPreview])
def read_tests(
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker())
):
    stmt = select(Test).options(joinedload(Test.category))
    tests = session.scalars(stmt).all()
    return tests


@router.get("/{test_id}", response_model=TestRead)
def read_test(
    test_id: int,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(user_only=True))
):
    stmt = (
        select(Test)
        .where(Test.id == test_id)
        .options(
            joinedload(Test.category),
            selectinload(Test.questions).joinedload(Question.answers)
        )
    )

    test_db = session.scalar(stmt)

    if not test_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")

    return test_db


@router.get("/admin/{test_id}", response_model=TestReadWithAnswers)
def read_test_admin(
    test_id: int,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = (
        select(Test)
        .where(Test.id == test_id)
        .options(
            joinedload(Test.category),
            selectinload(Test.questions).joinedload(Question.answers)
        )
    )

    test_db = session.scalar(stmt)

    if not test_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")

    return test_db


@router.post("/{test_id}", response_model=TestReadWithAnswers)
def update_test(
    test_id: int,
    test: TestUpdate,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    try:
        updated_test = update_test_with_questions(test_id, test, session)
        return updated_test
    except Exception as exception:
        session.rollback()
        raise exception


@router.delete("/{test_id}")
def delete_test(
    test_id: int,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = select(Test).where(Test.id == test_id)
    test_db = session.scalar(stmt)

    if not test_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")

    session.delete(test_db)
    session.commit()
    return {"ok": True}
