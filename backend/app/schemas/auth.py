from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="Tanvir Ahmed")
    phone: str = Field(..., min_length=10, max_length=20, example="01712345678")
    email: Optional[EmailStr] = Field(None, example="tanvir@example.com")
    password: str = Field(..., min_length=4, max_length=50, example="123456")


class UserLoginRequest(BaseModel):
    phone: str = Field(..., example="01712345678")
    password: str = Field(..., min_length=4, example="123456")


class AdminLoginRequest(BaseModel):
    email: EmailStr = Field(..., example="admin@gencash.com")
    password: str = Field(..., min_length=6, example="admin123456")


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = None
    profile_image: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_image: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
