from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from backend.database.database import get_db

from backend.services.dashboard_service import (
    get_dashboard_summary
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):

    return get_dashboard_summary(db)