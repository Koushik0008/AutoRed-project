from sqlalchemy.orm import Session

from backend.database.models import TargetDB


def create_target(
    db: Session,
    name: str,
    target_type: str,
    endpoint_url: str | None,
    description: str | None
):

    target = TargetDB(
        name=name,
        target_type=target_type,
        endpoint=endpoint_url,
        description=description,
        status="ACTIVE"
    )

    db.add(target)
    db.commit()
    db.refresh(target)

    return target


def get_all_targets(
    db: Session
):

    return (
        db.query(TargetDB)
        .order_by(TargetDB.id.desc())
        .all()
    )


def get_target(
    db: Session,
    target_id: int
):

    return (
        db.query(TargetDB)
        .filter(
            TargetDB.id == target_id
        )
        .first()
    )


def delete_target(
    db: Session,
    target: TargetDB
):

    db.delete(target)
    db.commit()