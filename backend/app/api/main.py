from fastapi import APIRouter

from api.routs import user, login, category, test, test_result, recommendation

api_router = APIRouter()
api_router.include_router(user.router)
api_router.include_router(login.router)
api_router.include_router(category.router)
api_router.include_router(test.router)
api_router.include_router(test_result.router)
api_router.include_router(recommendation.router)
