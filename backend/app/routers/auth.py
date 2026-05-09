import random
import string

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import create_access_token, get_current_user, validate_password

router = APIRouter()


def _hash(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(12)).decode()


def _verify(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def _generate_account_number(db: Session) -> str:
    """Generate a unique random 16-digit account number."""
    while True:
        number = "".join(random.choices(string.digits, k=16))
        if not db.query(models.User).filter(models.User.account_number == number).first():
            return number


@router.post("/register", response_model=schemas.Token, status_code=201)
def register(body: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # Validate password rules (RF-02)
    error = validate_password(body.password)
    if error:
        raise HTTPException(status_code=422, detail=error)

    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Este correo ya está registrado")

    user = models.User(
        email=body.email,
        password_hash=_hash(body.password),
        full_name=body.full_name,
        account_number=_generate_account_number(db),
        balance=10000.00,   # Starting balance for demo
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"access_token": create_access_token(user.id), "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()

    # Record failed attempt if user exists and account is blocked
    if user and user.is_blocked:
        raise HTTPException(
            status_code=403,
            detail="Cuenta bloqueada. Contacta al administrador.",
        )

    if not user or not _verify(body.password, user.password_hash):
        # Log audit entry
        reason = f"Contraseña incorrecta para {body.email}"
        db.add(models.AuditLog(email=body.email, reason=reason))

        if user:
            user.failed_attempts += 1
            if user.failed_attempts >= 3:
                user.is_blocked = True
                db.commit()
                raise HTTPException(
                    status_code=403,
                    detail="Cuenta bloqueada por 3 intentos fallidos. Contacta al administrador.",
                )
        db.commit()
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas. Verifica tu correo y contraseña.",
        )

    # Successful login — reset counter
    user.failed_attempts = 0
    db.commit()

    return {"access_token": create_access_token(user.id), "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
