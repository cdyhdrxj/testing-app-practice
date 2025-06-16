from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.test import Test
from models.question import Question
from models.answer import Answer
from schemas.test import TestUpdate


def update_test_with_questions(
    test_id: int,
    test_data: TestUpdate,
    session: Session
):
    test = session.get(Test, test_id)
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")

    test.name = test_data.name
    test.category_id = test_data.category_id

    # Обрабатываем вопросы
    existing_question_ids = {q.id for q in test.questions}
    new_question_ids = set()
    
    for question_data in test_data.questions:
        # Если вопрос существует - обновляем
        if hasattr(question_data, 'id') and question_data.id in existing_question_ids:
            question = next(q for q in test.questions if q.id == question_data.id)
            question.text = question_data.text
            question.type = question_data.type
            new_question_ids.add(question.id)
            
            # Обрабатываем ответы вопроса
            existing_answer_ids = {a.id for a in question.answers}
            new_answer_ids = set()
            
            for answer_data in question_data.answers:
                if hasattr(answer_data, 'id') and answer_data.id in existing_answer_ids:
                    # Обновляем существующий ответ
                    answer = next(a for a in question.answers if a.id == answer_data.id)
                    answer.text = answer_data.text
                    answer.is_correct = answer_data.is_correct
                    new_answer_ids.add(answer.id)
                else:
                    # Добавляем новый ответ
                    new_answer = Answer(
                        text=answer_data.text,
                        is_correct=answer_data.is_correct
                    )
                    question.answers.append(new_answer)
            
            # Удаляем ответы, которых нет в новых данных
            for answer in question.answers[:]:
                if answer.id not in new_answer_ids and answer.id is not None:
                    session.delete(answer)
        
        else:
            # Добавляем новый вопрос с ответами
            new_question = Question(
                text=question_data.text,
                type=question_data.type,
                answers=[
                    Answer(
                        text=a.text,
                        is_correct=a.is_correct
                    ) for a in question_data.answers
                ]
            )
            test.questions.append(new_question)
    
    # Удаляем вопросы, которых нет в новых данных
    for question in test.questions[:]:
        if question.id not in new_question_ids and question.id is not None:
            session.delete(question)

    session.commit()
    session.refresh(test)
    return test
