from pydantic import BaseModel
from typing import List, Optional

# --- Schedule Schemas ---
class ScheduleBase(BaseModel):
    time: str
    title: str
    loc: str
    type: str
    status: str

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

# --- Goal Schemas ---
class GoalBase(BaseModel):
    title: str
    category: str
    progress: float = 0.0
    streak: int = 0

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

# --- User Auth & Profile Schemas ---
class UserBase(BaseModel):
    registration_number: str
    name: str
    branch: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    registration_number: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfile(UserBase):
    id: int
    cgpa: float
    attendance: float
    goals: List[Goal] = []
    schedule: List[Schedule] = []

    class Config:
        from_attributes = True
