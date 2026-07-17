import uuid
from pydantic import BaseModel


class HabitBase(BaseModel):
    name: str
    frequency: str = "daily"


class HabitCreate(HabitBase):
    pass


class HabitRead(HabitBase):
    id: uuid.UUID
    streak: int
    history: list[str]

    class Config:
        from_attributes = True
