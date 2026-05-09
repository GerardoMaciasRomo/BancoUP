from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter()

MAX_BALANCE = Decimal("50000.00")
MIN_AMOUNT  = Decimal("500.00")
MAX_AMOUNT  = Decimal("7000.00")


@router.post("/", status_code=201)
def create_transfer(
    body: schemas.TransferRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    amount = Decimal(str(body.amount))

    # Can't transfer to yourself
    if body.receiver_account == current_user.account_number:
        raise HTTPException(status_code=400, detail="No puedes transferir a tu propia cuenta")

    # Look up receiver (RF-05: internal accounts only)
    receiver = db.query(models.User).filter(
        models.User.account_number == body.receiver_account
    ).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Cuenta destino no encontrada en el sistema")

    # Validate sender balance (RF-10: no overdraft)
    if current_user.balance < amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente para realizar la transferencia")

    # Validate receiver won't exceed max balance (RF-08, RF-09)
    if receiver.balance + amount > MAX_BALANCE:
        raise HTTPException(
            status_code=400,
            detail=f"La transferencia excede el saldo máximo permitido ($50,000 MXN) en la cuenta destino",
        )

    # Execute transfer atomically
    current_user.balance -= amount
    receiver.balance     += amount

    tx = models.Transaction(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        receiver_account=body.receiver_account,
        amount=amount,
        concept=body.concept,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    return {"message": "Transferencia realizada con éxito", "transaction_id": tx.id}


@router.get("/", response_model=list[schemas.MovementResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all movements (sent + received) ordered by most recent."""
    txs = (
        db.query(models.Transaction)
        .filter(
            or_(
                models.Transaction.sender_id   == current_user.id,
                models.Transaction.receiver_id == current_user.id,
            )
        )
        .order_by(models.Transaction.created_at.desc())
        .all()
    )

    movements = []
    for tx in txs:
        if tx.sender_id == current_user.id:
            movements.append(schemas.MovementResponse(
                id=tx.id,
                direction="enviado",
                counterpart_account=tx.receiver_account,
                amount=float(tx.amount),
                concept=tx.concept,
                created_at=tx.created_at,
            ))
        else:
            movements.append(schemas.MovementResponse(
                id=tx.id,
                direction="recibido",
                counterpart_account=current_user.account_number,
                amount=float(tx.amount),
                concept=tx.concept,
                created_at=tx.created_at,
            ))
    return movements
