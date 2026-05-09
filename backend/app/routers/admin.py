from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import require_admin

router = APIRouter()


@router.get("/blocked-users", response_model=list[schemas.BlockedUserResponse])
def list_blocked_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    return db.query(models.User).filter(
        models.User.is_blocked == True,
        models.User.role == "user",
    ).all()


@router.post("/unblock/{user_id}")
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.is_blocked = False
    user.failed_attempts = 0
    db.commit()
    return {"message": f"Cuenta de {user.email} desbloqueada exitosamente"}


@router.get("/audit-log", response_model=list[schemas.AuditLogResponse])
def get_audit_log(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    return (
        db.query(models.AuditLog)
        .order_by(models.AuditLog.attempted_at.desc())
        .limit(200)
        .all()
    )
