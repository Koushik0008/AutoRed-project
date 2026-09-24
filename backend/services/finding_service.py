from sqlalchemy.orm import Session

from backend.database.models import FindingDB


def get_all_findings(
    db: Session
):

    return (
        db.query(FindingDB)
        .order_by(FindingDB.id.desc())
        .all()
    )


def get_finding(
    db: Session,
    finding_id: int
):

    return (
        db.query(FindingDB)
        .filter(
            FindingDB.id == finding_id
        )
        .first()
    )