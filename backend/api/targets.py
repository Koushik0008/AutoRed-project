from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from pydantic import BaseModel

from sqlalchemy.orm import Session

from backend.database.database import get_db

from backend.services.target_service import (
    create_target,
    get_all_targets,
    get_target,
    delete_target
)


router = APIRouter(
    prefix="/targets",
    tags=["Targets"]
)


class TargetRequest(BaseModel):

    name: str

    target_type: str = "MOCK"

    endpoint_url: str | None = None

    description: str | None = None


@router.post("")
def create_new_target(
    request: TargetRequest,
    db: Session = Depends(get_db)
):

    try:

        target = create_target(
            db=db,
            name=request.name,
            target_type=request.target_type,
            endpoint_url=request.endpoint_url,
            description=request.description
        )

        return {
            "message": "Target created successfully.",
            "target": {
                "id": target.id,
                "name": target.name,
                "target_type": target.target_type,
                "endpoint_url": target.endpoint,
                "description": target.description,
                "status": target.status,
                "created_at": target.created_at
            }
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create target: {str(e)}"
        )


@router.get("")
def list_targets(
    db: Session = Depends(get_db)
):

    try:

        targets = get_all_targets(db)

        return {
            "total": len(targets),
            "targets": [
                {
                    "id": target.id,
                    "name": target.name,
                    "target_type": target.target_type,
                    "endpoint_url": target.endpoint,
                    "description": target.description,
                    "status": target.status,
                    "created_at": target.created_at
                }
                for target in targets
            ]
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve targets: {str(e)}"
        )


@router.get("/{target_id}")
def get_single_target(
    target_id: int,
    db: Session = Depends(get_db)
):

    target = get_target(
        db=db,
        target_id=target_id
    )

    if target is None:

        raise HTTPException(
            status_code=404,
            detail="Target not found."
        )

    return {
        "id": target.id,
        "name": target.name,
        "target_type": target.target_type,
        "endpoint_url": target.endpoint,
        "description": target.description,
        "status": target.status,
        "created_at": target.created_at
    }


@router.delete("/{target_id}")
def remove_target(
    target_id: int,
    db: Session = Depends(get_db)
):

    target = get_target(
        db=db,
        target_id=target_id
    )

    if target is None:

        raise HTTPException(
            status_code=404,
            detail="Target not found."
        )

    delete_target(
        db=db,
        target=target
    )

    return {
        "message": "Target deleted successfully.",
        "target_id": target_id
    }