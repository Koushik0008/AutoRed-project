from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from backend.database.database import get_db

from backend.services.finding_service import (
    get_all_findings,
    get_finding
)


router = APIRouter(
    prefix="/findings",
    tags=["Findings"]
)


# ============================================================
# GET ALL FINDINGS
# ============================================================

@router.get("")
def list_findings(
    db: Session = Depends(get_db)
):

    findings = get_all_findings(db)

    return {
        "total": len(findings),

        "findings": [
            {
                "id": finding.id,
                "campaign_id": finding.campaign_id,
                "attack_id": finding.attack_id,
                "title": finding.title,
                "category": finding.category,
                "severity": finding.severity,
                "confidence": finding.confidence,
                "reason": finding.reason,
                "evidence": finding.evidence,
                "created_at": finding.created_at
            }

            for finding in findings
        ]
    }


# ============================================================
# GET ONE FINDING
# ============================================================

@router.get("/{finding_id}")
def get_single_finding(
    finding_id: int,
    db: Session = Depends(get_db)
):

    finding = get_finding(
        db=db,
        finding_id=finding_id
    )

    if finding is None:

        raise HTTPException(
            status_code=404,
            detail="Finding not found."
        )

    return {
        "id": finding.id,
        "campaign_id": finding.campaign_id,
        "attack_id": finding.attack_id,
        "title": finding.title,
        "category": finding.category,
        "severity": finding.severity,
        "confidence": finding.confidence,
        "reason": finding.reason,
        "evidence": finding.evidence,
        "created_at": finding.created_at
    }