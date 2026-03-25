from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True)
    name = Column(String)
    branch = Column(String)
    cgpa = Column(Float, default=0.0)
    attendance = Column(Float, default=0.0)
    hashed_password = Column(String)

    goals = relationship("Goal", back_populates="owner")
    schedule = relationship("Schedule", back_populates="owner")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String) # Academic, Personal, Career, Financial
    progress = Column(Float, default=0.0)
    streak = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="goals")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    time = Column(String) # e.g., "08:30"
    title = Column(String)
    loc = Column(String)
    type = Column(String) # Theory, Lab, Chill
    status = Column(String) # Done, Live, Upcoming
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="schedule")
