from sqlalchemy.orm import Session

from backend.database.models import CampaignDB
from backend.database.models import AttackDB
from backend.database.models import FindingDB


def get_dashboard_summary(db: Session):

    total_campaigns = (
        db.query(CampaignDB)
        .count()
    )

    total_attacks = (
        db.query(AttackDB)
        .count()
    )

    total_findings = (
        db.query(FindingDB)
        .count()
    )

    vulnerable_attacks = (
        db.query(AttackDB)
        .filter(
            AttackDB.status == "VULNERABLE"
        )
        .count()
    )

    safe_attacks = (
        db.query(AttackDB)
        .filter(
            AttackDB.status == "SAFE"
        )
        .count()
    )

    critical_findings = (
        db.query(FindingDB)
        .filter(
            FindingDB.severity == "CRITICAL"
        )
        .count()
    )

    high_findings = (
        db.query(FindingDB)
        .filter(
            FindingDB.severity == "HIGH"
        )
        .count()
    )

    medium_findings = (
        db.query(FindingDB)
        .filter(
            FindingDB.severity == "MEDIUM"
        )
        .count()
    )

    low_findings = (
        db.query(FindingDB)
        .filter(
            FindingDB.severity == "LOW"
        )
        .count()
    )

    return {
        "total_campaigns": total_campaigns,
        "total_attacks": total_attacks,
        "total_findings": total_findings,
        "vulnerable_attacks": vulnerable_attacks,
        "safe_attacks": safe_attacks,
        "severity": {
            "critical": critical_findings,
            "high": high_findings,
            "medium": medium_findings,
            "low": low_findings
        }
    }