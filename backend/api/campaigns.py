from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.services.campaign_service import (
    create_campaign,
    run_campaign
)
from backend.database.models import CampaignDB, TargetDB


router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"]
)


class CampaignRequest(BaseModel):
    objective: str
    category: str
    max_iterations: int = 3
    target_id: int


@router.post("")
def create_new_campaign(
    request: CampaignRequest,
    db: Session = Depends(get_db)
):
    try:
        campaign = create_campaign(
            db=db,
            objective=request.objective,
            category=request.category,
            max_iterations=request.max_iterations,
            target_id=request.target_id
        )

        return {
            "message": "Campaign created successfully.",
            "campaign": {
                "id": campaign.id,
                "target_id": campaign.target_id,
                "objective": campaign.objective,
                "category": campaign.category,
                "max_iterations": campaign.max_iterations,
                "status": campaign.status,
                "total_iterations": campaign.total_iterations,
                "created_at": campaign.created_at
            }
        }

    except ValueError as e:
        db.rollback()

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create campaign: {str(e)}"
        )


@router.get("")
def list_campaigns(
    db: Session = Depends(get_db)
):
    try:
        campaigns = (
            db.query(CampaignDB)
            .order_by(CampaignDB.id.desc())
            .all()
        )

        results = []

        for campaign in campaigns:

            target = (
                db.query(TargetDB)
                .filter(TargetDB.id == campaign.target_id)
                .first()
            )

            results.append({
                "id": campaign.id,
                "target_id": campaign.target_id,
                "target_name": (
                    target.name
                    if target
                    else "Unknown Target"
                ),
                "objective": campaign.objective,
                "category": campaign.category,
                "max_iterations": campaign.max_iterations,
                "status": campaign.status,
                "total_iterations": campaign.total_iterations,
                "created_at": campaign.created_at
            })

        return {
            "total": len(results),
            "campaigns": results
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve campaigns: {str(e)}"
        )


@router.get("/{campaign_id}")
def get_single_campaign(
    campaign_id: int,
    db: Session = Depends(get_db)
):

    campaign = (
        db.query(CampaignDB)
        .filter(CampaignDB.id == campaign_id)
        .first()
    )

    if campaign is None:

        raise HTTPException(
            status_code=404,
            detail="Campaign not found."
        )

    target = (
        db.query(TargetDB)
        .filter(TargetDB.id == campaign.target_id)
        .first()
    )

    return {
        "id": campaign.id,
        "target_id": campaign.target_id,
        "target_name": (
            target.name
            if target
            else "Unknown Target"
        ),
        "objective": campaign.objective,
        "category": campaign.category,
        "max_iterations": campaign.max_iterations,
        "status": campaign.status,
        "total_iterations": campaign.total_iterations,
        "created_at": campaign.created_at
    }


@router.post("/{campaign_id}/run")
def execute_campaign(
    campaign_id: int,
    db: Session = Depends(get_db)
):

    campaign = (
        db.query(CampaignDB)
        .filter(CampaignDB.id == campaign_id)
        .first()
    )

    if campaign is None:

        raise HTTPException(
            status_code=404,
            detail="Campaign not found."
        )

    try:

        results = run_campaign(
            db=db,
            campaign=campaign
        )

        return {
            "message": "Campaign completed successfully.",
            "campaign_id": campaign.id,
            "status": campaign.status,
            "total_iterations": campaign.total_iterations,
            "results": [
                {
                    "iteration": result["finding"].iteration,
                    "strategy": result["finding"].strategy,
                    "category": result["finding"].category,
                    "status": result["finding"].status,
                    "severity": result["finding"].severity,
                    "confidence": result["finding"].confidence,
                    "reason": result["finding"].reason
                }
                for result in results
            ]
        }

    except Exception as e:

        db.rollback()

        campaign.status = "FAILED"

        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Campaign execution failed: {str(e)}"
        )