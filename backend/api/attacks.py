from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import AttackDB, CampaignDB


router = APIRouter(
    prefix="/attacks",
    tags=["Attacks"],
)


@router.get("")
def list_attacks(
    campaign_id: int | None = None,
    status: str | None = None,
    severity: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Return attacks with optional filters.
    """

    query = db.query(AttackDB)

    if campaign_id is not None:
        query = query.filter(
            AttackDB.campaign_id == campaign_id
        )

    if status:
        query = query.filter(
            AttackDB.status == status
        )

    if severity:
        query = query.filter(
            AttackDB.severity == severity
        )

    if category:
        query = query.filter(
            AttackDB.category == category
        )

    attacks = (
        query
        .order_by(AttackDB.id.desc())
        .all()
    )

    return {
        "total": len(attacks),
        "attacks": [
            {
                "id": attack.id,
                "campaign_id": attack.campaign_id,
                "iteration": attack.iteration,

                "strategy": attack.strategy,
                "category": attack.category,

                "prompt": attack.prompt,
                "target_response": attack.target_response,

                "status": attack.status,
                "severity": attack.severity,
                "confidence": attack.confidence,

                "reason": attack.reason,

                # NEW
                "adaptation_reason": attack.adaptation_reason,

                "created_at": attack.created_at,
            }
            for attack in attacks
        ],
    }


@router.get("/{attack_id}")
def get_attack(
    attack_id: int,
    db: Session = Depends(get_db),
):
    """
    Return complete details for one attack.
    """

    attack = (
        db.query(AttackDB)
        .filter(AttackDB.id == attack_id)
        .first()
    )

    if attack is None:
        raise HTTPException(
            status_code=404,
            detail=f"Attack #{attack_id} not found.",
        )

    campaign = (
        db.query(CampaignDB)
        .filter(CampaignDB.id == attack.campaign_id)
        .first()
    )

    return {
        "attack": {
            "id": attack.id,
            "campaign_id": attack.campaign_id,

            "campaign_objective": (
                campaign.objective
                if campaign
                else None
            ),

            "iteration": attack.iteration,

            "strategy": attack.strategy,
            "category": attack.category,

            "prompt": attack.prompt,
            "target_response": attack.target_response,

            "status": attack.status,
            "severity": attack.severity,
            "confidence": attack.confidence,

            "reason": attack.reason,

            # NEW
            "adaptation_reason": attack.adaptation_reason,

            "created_at": attack.created_at,
        }
    }