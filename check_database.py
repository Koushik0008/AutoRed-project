from backend.database.database import SessionLocal
from backend.database.models import (
    TargetDB,
    CampaignDB,
    AttackDB,
    FindingDB
)


db = SessionLocal()


try:

    print()
    print("=" * 60)
    print("AUTored DATABASE CHECK")
    print("=" * 60)

    # --------------------------------------------------
    # TARGETS
    # --------------------------------------------------

    targets = (
        db.query(TargetDB)
        .order_by(TargetDB.id)
        .all()
    )

    print()
    print("TARGETS:", len(targets))

    for target in targets:

        print(
            f"  ID={target.id} | "
            f"NAME={target.name} | "
            f"TYPE={target.target_type} | "
            f"STATUS={target.status}"
        )

    # --------------------------------------------------
    # CAMPAIGNS
    # --------------------------------------------------

    campaigns = (
        db.query(CampaignDB)
        .order_by(CampaignDB.id)
        .all()
    )

    print()
    print("CAMPAIGNS:", len(campaigns))

    for campaign in campaigns:

        print(
            f"  ID={campaign.id} | "
            f"TARGET_ID={campaign.target_id} | "
            f"STATUS={campaign.status}"
        )

    # --------------------------------------------------
    # ATTACKS
    # --------------------------------------------------

    attacks = (
        db.query(AttackDB)
        .all()
    )

    print()
    print("ATTACKS:", len(attacks))

    vulnerable = (
        db.query(AttackDB)
        .filter(
            AttackDB.status == "VULNERABLE"
        )
        .count()
    )

    safe = (
        db.query(AttackDB)
        .filter(
            AttackDB.status == "SAFE"
        )
        .count()
    )

    print("VULNERABLE:", vulnerable)
    print("SAFE:", safe)

    # --------------------------------------------------
    # FINDINGS
    # --------------------------------------------------

    findings = (
        db.query(FindingDB)
        .all()
    )

    print()
    print("FINDINGS:", len(findings))

    severities = [
        finding.severity
        for finding in findings
    ]

    print("SEVERITIES:", severities)

    print()
    print("=" * 60)


finally:

    db.close()