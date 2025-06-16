from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload, joinedload
from typing import Annotated

from models.test_result import TestResult
from models.test import Test
from models.question import Question
from schemas.test_result import TestResultRead, TestResultCreate
from schemas.question import QuestionType
from schemas.user import UserRead
from general.auth import get_current_active_user
from api.deps import SessionDep
from general.permission_checker import PermissionChecker

router = APIRouter(
    prefix="/results",
    tags=["Результаты теста"],
)

@router.post("/{test_id}", response_model=TestResultRead)
def create_test_results(
    test_id: int,
    results: TestResultCreate,
    session: SessionDep,
    current_user: Annotated[UserRead, Depends(get_current_active_user)],
    authorize: bool = Depends(PermissionChecker(user_only=True))
):
    test = session.scalar(
        select(Test)
        .where(Test.id == test_id)
        .options(selectinload(Test.questions).joinedload(Question.answers))
    )
    
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")

    # Создаем словарь вопросов и правильных ответов для быстрого доступа
    questions_map = {
        q.id: {
            'question': q,
            'correct_answers': {a.id for a in q.answers if a.is_correct},
            'type': q.type
        }
        for q in test.questions
    }

    total_questions = len(questions_map)
    score = 0

    for user_question in results.questions:
        question_data = questions_map.get(user_question.id)
        if not question_data:
            continue  # Пропускаем вопросы, которых нет в тесте

        question = question_data['question']
        correct_answers = question_data['correct_answers']

        if question_data['type'] == QuestionType.SINGLE:
            # Для вопроса с одним вариантом ответа
            user_answer_ids = {a.id for a in user_question.answers if a.id}
            if len(user_answer_ids) == 1 and user_answer_ids.issubset(correct_answers):
                score += 1

        elif question_data['type'] == QuestionType.MULTIPLE:
            # Для вопроса с несколькими вариантами
            user_answer_ids = {a.id for a in user_question.answers if a.id}
            if user_answer_ids == correct_answers:
                score += 1

        elif question_data['type'] == QuestionType.TEXT:
            # Для текстового вопроса (проверяем первый ответ)
            if user_question.answers and user_question.answers[0].text:
                correct_texts = [a.text.lower().strip() for a in question.answers if a.is_correct]
                user_text = user_question.answers[0].text.lower().strip()
                if user_text in correct_texts:
                    score += 1

    test_result = TestResult(
        test_id=test_id,
        user_id=current_user.id,
        score=score,
        full_score=total_questions,
        time_start=results.time_start,
        time_end=results.time_end
    )

    session.add(test_result)
    session.commit()
    session.refresh(test_result)

    return test_result


@router.get("/", response_model=list[TestResultRead])
def read_user_tests_results(
    session: SessionDep,
    current_user: Annotated[UserRead, Depends(get_current_active_user)],
    authorize: bool = Depends(PermissionChecker(user_only=True))
):
    user_id = current_user.id

    stmt = (
        select(TestResult)
        .where(TestResult.user_id == user_id)
        .options(
            joinedload(TestResult.user),
            joinedload(TestResult.test).joinedload(Test.category)
        )
    )

    test_results = session.scalars(stmt).unique().all()
    return test_results


@router.get("/{test_id}", response_model=list[TestResultRead])
def read_user_test_results(
    test_id: int,
    session: SessionDep,
    current_user: Annotated[UserRead, Depends(get_current_active_user)],
    authorize: bool = Depends(PermissionChecker(user_only=True))
):
    user_id = current_user.id

    stmt = (
        select(TestResult)
        .where(
            and_(
                TestResult.test_id == test_id,
                TestResult.user_id == user_id
            )
        )
        .options(
            joinedload(TestResult.user),
            joinedload(TestResult.test).joinedload(Test.category)
        )
    )

    test_results = session.scalars(stmt).unique().all()
    return test_results


@router.get("/admin/{test_id}", response_model=list[TestResultRead])
def read_tests_results(
    test_id: int,
    session: SessionDep,
    authorize: bool = Depends(PermissionChecker(admin_only=True))
):
    stmt = (
        select(TestResult)
        .where(TestResult.test_id == test_id)
        .options(
            joinedload(TestResult.user),
            joinedload(TestResult.test).joinedload(Test.category)
        )
    )

    test_results = session.scalars(stmt).unique().all()
    return test_results
