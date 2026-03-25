from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from routers.auth import get_current_user
from services.vtop_scraper import scrape_vtop_data
from pydantic import BaseModel

class SyncRequest(BaseModel):
    cookies: str

router = APIRouter(
    prefix="/schedules",
    tags=["Schedules"]
)

@router.post("/", response_model=schemas.Schedule)
def create_schedule(schedule: schemas.ScheduleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_schedule = models.Schedule(**schedule.dict(), owner_id=current_user.id)
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule

@router.post("/sync-vtop")
async def sync_vtop(req: SyncRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Run the VTOP asynchronous scraper
    try:
        result = await scrape_vtop_data(req.cookies, current_user.registration_number)
        return {"message": "Sync triggered successfully", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.Schedule])
def get_schedules(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Schedule).filter(models.Schedule.owner_id == current_user.id).all()

@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id, models.Schedule.owner_id == current_user.id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
    return {"message": "Schedule deleted successfully"}
