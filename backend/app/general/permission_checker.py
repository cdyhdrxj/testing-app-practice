from fastapi import status, Depends, HTTPException

from schemas.user import UserRead
from general.auth import get_current_active_user

class PermissionChecker:
    def __init__(self, user_only: bool = False, admin_only: bool = False) -> None:
        if user_only and admin_only:
            raise Exception("Некорректные параметры")
        self.user_only = user_only
        self.admin_only = admin_only

    def __call__(self, user: UserRead = Depends(get_current_active_user)) -> bool:
        if self.user_only and user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")
        if self.admin_only and not user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")
        return True
