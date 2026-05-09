import os
import random
import string
from contextlib import asynccontextmanager
from decimal import Decimal

import bcrypt as _bcrypt

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routers import auth, transactions, admin


def _hash(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt(12)).decode()


def _seed_db():
    """Create default admin + demo users if DB is empty."""
    from app import models

    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            return

        def gen_account():
            while True:
                n = "".join(random.choices(string.digits, k=16))
                if not db.query(models.User).filter(models.User.account_number == n).first():
                    return n

        users = [
            models.User(
                email="admin@bancoup.mx",
                password_hash=_hash("Admin1!"),
                full_name="Administrador Banco UP",
                account_number=gen_account(),
                balance=Decimal("0.00"),
                role="admin",
            ),
            models.User(
                email="cliente1@bancoup.mx",
                password_hash=_hash("Test1!"),
                full_name="Ana García López",
                account_number=gen_account(),
                balance=Decimal("15000.00"),
            ),
            models.User(
                email="cliente2@bancoup.mx",
                password_hash=_hash("Test1!"),
                full_name="Carlos Pérez Ruiz",
                account_number=gen_account(),
                balance=Decimal("8500.00"),
            ),
        ]
        db.add_all(users)
        db.commit()
        print("✅ Datos de prueba creados")
        print(f"   Admin:    admin@bancoup.mx   / Admin1!")
        print(f"   Cliente1: cliente1@bancoup.mx / Test1!")
        print(f"   Cliente2: cliente2@bancoup.mx / Test1!")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _seed_db()
    yield


app = FastAPI(
    title="Banco UP API",
    description="API REST para el sistema de transferencias bancarias Banco UP",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,         prefix="/api/auth",         tags=["Autenticación"])
app.include_router(transactions.router, prefix="/api/transactions",  tags=["Transferencias"])
app.include_router(admin.router,        prefix="/api/admin",         tags=["Administrador"])


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "sistema": "Banco UP v1.1"}
