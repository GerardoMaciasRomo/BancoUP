from decimal import Decimal
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


# ── Auth ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    account_number: str
    balance: float
    role: str
    is_blocked: bool

    model_config = {"from_attributes": True}

    @field_validator("balance", mode="before")
    @classmethod
    def decimal_to_float(cls, v):
        return float(v) if isinstance(v, Decimal) else v


# ── Transactions ──────────────────────────────────────────────────────

class TransferRequest(BaseModel):
    receiver_account: str
    amount: float
    concept: str

    @field_validator("receiver_account")
    @classmethod
    def must_be_16_digits(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 16:
            raise ValueError("El número de cuenta debe tener exactamente 16 dígitos numéricos")
        return v

    @field_validator("amount")
    @classmethod
    def valid_amount(cls, v: float) -> float:
        if v < 500 or v > 7000:
            raise ValueError("El monto debe estar entre $500 y $7,000 MXN")
        return round(v, 2)

    @field_validator("concept")
    @classmethod
    def concept_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El concepto no puede estar vacío")
        return v.strip()


class MovementResponse(BaseModel):
    id: int
    direction: str           # "enviado" | "recibido"
    counterpart_account: str
    amount: float
    concept: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Admin ─────────────────────────────────────────────────────────────

class BlockedUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    account_number: str

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id: int
    email: str
    reason: str
    attempted_at: datetime

    model_config = {"from_attributes": True}
