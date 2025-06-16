from fastapi import APIRouter, Depends
from sqlalchemy import select, func, desc, not_
from sqlalchemy.orm import aliased, joinedload
from typing import Annotated

from models.test import Test
from models.test_result import TestResult

from schemas.test import TestReadPreview
from schemas.user import UserRead 
from general.permission_checker import PermissionChecker
from api.deps import SessionDep
from general.auth import get_current_active_user

router = APIRouter(
    prefix="/recommend",
    tags=["Рекомендованные тесты"],
)

NUMBER_OF_TESTS = 3

@router.get("/", response_model=list[TestReadPreview])
def recommend_test_to_user(
    session: SessionDep,
    current_user: Annotated[UserRead, Depends(get_current_active_user)],
    authorize: bool = Depends(PermissionChecker(user_only=True))
):
    user_id = current_user.id

    # Подзапрос для подсчета пройденных тестов пользователя по категориям
    UserCategoryCount = aliased(
        select(
            Test.category_id,
            func.count().label('count')
        )
        .join(TestResult, TestResult.test_id == Test.id)
        .where(TestResult.user_id == user_id)
        .group_by(Test.category_id)
        .subquery()
    )
    
    # Подзапрос для подсчета общего количества прохождений каждого теста
    TestPopularity = aliased(
        select(
            TestResult.test_id,
            func.count().label('completions')
        )
        .group_by(TestResult.test_id)
        .subquery()
    )
    
    # Запрос для получения рекомендованных тестов
    stmt = (
        select(Test)
        .join(
            UserCategoryCount,
            UserCategoryCount.c.category_id == Test.category_id,
            isouter=True
        )
        .join(
            TestPopularity,
            TestPopularity.c.test_id == Test.id,
            isouter=True
        )
        .options(joinedload(Test.category))
        .where(
            not_(Test.results.any(TestResult.user_id == user_id))  # Непройденные тесты
        )
        .order_by(
            desc(func.coalesce(UserCategoryCount.c.count, 0)),
            desc(func.coalesce(TestPopularity.c.completions, 0)),
        )
        .limit(NUMBER_OF_TESTS)
    )
    
    recommended_tests = session.scalars(stmt).unique().all()
    return recommended_tests
