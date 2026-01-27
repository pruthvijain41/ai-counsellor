from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from typing import Optional
import uuid

from database import get_db
from models import User, Profile
from schemas import UserCreate, UserLogin, UserResponse, Token, TokenData, GoogleAuthRequest
from config import get_settings

router = APIRouter()
settings = get_settings()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = decode_token(token)
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create empty profile for user
    new_profile = Profile(user_id=new_user.id)
    db.add(new_profile)
    db.commit()
    
    # Generate token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return Token(access_token=access_token)

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(access_token=access_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout():
    # For JWT-based auth, logout is handled client-side by removing the token
    return {"message": "Logged out successfully"}

@router.post("/google", response_model=Token)
async def google_auth(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Handle Google OAuth authentication.
    Creates a new user if the email doesn't exist, otherwise returns existing user.
    """
    # Check if user already exists by email
    existing_user = db.query(User).filter(User.email == auth_data.email).first()
    
    if existing_user:
        # User exists, generate token
        access_token = create_access_token(data={"sub": str(existing_user.id)})
        return Token(access_token=access_token)
    
    # Create new user (no password for Google auth users)
    # Generate a random password hash since we don't use it for OAuth users
    import secrets
    dummy_password_hash = get_password_hash(secrets.token_urlsafe(32))
    
    new_user = User(
        email=auth_data.email,
        name=auth_data.name,
        password_hash=dummy_password_hash
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create empty profile for user
    new_profile = Profile(user_id=new_user.id)
    db.add(new_profile)
    db.commit()
    
    # Generate token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return Token(access_token=access_token)

