from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth_utils
from database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from auth_utils import SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        registration_number: str = payload.get("sub")
        if registration_number is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.registration_number == registration_number).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.registration_number == user.registration_number).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Registration number already registered")
    
    hashed_password = auth_utils.get_password_hash(user.password)
    
    # Create new user
    new_user = models.User(
        registration_number=user.registration_number,
        name=user.name,
        branch=user.branch,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically log them in after registration
    access_token = auth_utils.create_access_token(
        data={"sub": new_user.registration_number}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.registration_number == user.registration_number).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid registration number")
    
    if not auth_utils.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid password")
    
    access_token = auth_utils.create_access_token(
        data={"sub": db_user.registration_number}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserProfile)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
