from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(100), unique=True, nullable=False, index=True)
    password_hash   = Column(String(255), nullable=False)
    full_name       = Column(String(100), nullable=False)
    account_number  = Column(String(16), unique=True, nullable=False, index=True)
    balance         = Column(Numeric(10, 2), nullable=False, default=0.00)
    is_blocked      = Column(Boolean, default=False)
    failed_attempts = Column(Integer, default=0)
    role            = Column(String(10), default="user")   # "user" | "admin"
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    sent_transactions     = relationship("Transaction", foreign_keys="Transaction.sender_id",   back_populates="sender")
    received_transactions = relationship("Transaction", foreign_keys="Transaction.receiver_id", back_populates="receiver")


class Transaction(Base):
    __tablename__ = "transactions"

    id               = Column(Integer, primary_key=True, index=True)
    sender_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id      = Column(Integer, ForeignKey("users.id"), nullable=True)
    receiver_account = Column(String(16), nullable=False)
    amount           = Column(Numeric(10, 2), nullable=False)
    concept          = Column(String(200), nullable=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    sender   = relationship("User", foreign_keys=[sender_id],   back_populates="sent_transactions")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_transactions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id           = Column(Integer, primary_key=True, index=True)
    email        = Column(String(100), nullable=False)
    reason       = Column(String(200), nullable=False)
    attempted_at = Column(DateTime(timezone=True), server_default=func.now())
