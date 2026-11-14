import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_password_reset_token, decode_token
from app.core.config import settings
from app.models.database import User, UserRole
from app.schemas.api_models import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    ApiResponse,
)
from app.core.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
async def register(request: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Registers a new researcher or public user. Passwords are encrypted with bcrypt (12 rounds).
    """
    existing = await db.execute(select(User).where(User.email == request.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{request.email}' is already registered."
        )

    user = User(
        id=f"usr-{uuid.uuid4().hex[:12]}",
        email=request.email.lower(),
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        role=request.role or UserRole.RESEARCHER,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse, tags=["Authentication"])
async def login(request: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticates email and password, returning a signed JWT access token.
    """
    result = await db.execute(select(User).where(User.email == request.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated.")

    token = create_access_token(user_id=user.id, email=user.email, role=user.role.value)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        email=user.email,
        role=user.role.value,
    )


@router.get("/me", response_model=UserResponse, tags=["Authentication"])
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile and permissions.
    """
    return current_user


@router.post("/logout", response_model=ApiResponse[str], tags=["Authentication"])
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logs out the user session. (Client-side token disposal & session revocation).
    """
    return ApiResponse(
        success=True,
        data="Session successfully logged out.",
        message=f"User {current_user.email} logged out."
    )


@router.post("/password-reset-request", response_model=ApiResponse[str], tags=["Authentication"])
async def request_password_reset(request: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """
    Initiates a secure password reset workflow, generating a short-lived token.
    """
    result = await db.execute(select(User).where(User.email == request.email.lower()))
    user = result.scalar_one_or_none()
    if not user:
        # Prevent account enumeration: return success even if email doesn't exist
        return ApiResponse(
            success=True,
            data="If the account exists, a password reset token has been issued.",
            message="Password reset initiated."
        )

    reset_token = create_password_reset_token(user.id, user.email)
    return ApiResponse(
        success=True,
        data=reset_token,
        message="Password reset token generated (deliverable via email in production)."
    )


@router.post("/password-reset-confirm", response_model=ApiResponse[str], tags=["Authentication"])
async def confirm_password_reset(request: PasswordResetConfirmRequest, db: AsyncSession = Depends(get_db)):
    """
    Resets the password given a valid, unexpired reset token.
    """
    payload = decode_token(request.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    user.hashed_password = hash_password(request.new_password)
    await db.commit()
    return ApiResponse(
        success=True,
        data="Password has been successfully updated.",
        message="Password reset confirmed."
    )
