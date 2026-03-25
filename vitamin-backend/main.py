from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VITamin API", description="Backend for the VITamin App")

from routers import auth, goals, schedules

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(goals.router)
app.include_router(schedules.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the VITamin API"}
