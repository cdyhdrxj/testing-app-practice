from pydantic import BaseModel, Field

class UserBase(BaseModel):
    name: str = Field(min_length=3, max_length=64)
    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=64)

class UserRead(UserBase):
    id: int
    is_admin: bool
    is_blocked: bool

class UserLogin(UserRead):
    password_hash: str
    is_blocked: bool

class UserToken(UserBase):
    is_admin: bool
