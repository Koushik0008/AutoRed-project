import time

from sqlalchemy.orm import Session

from backend.database.models import (
    CampaignDB,
    AttackDB,
    TargetDB,
    FindingDB,
)

from backend.targets.factory import create_target_instance
from backend.agents.orchestrator import AutoRedOrchestrator


def create_campaign(
    db: Session,
    objective: str,
    category: str,
    max_iterations: int,
    target_id: int,
):
    """
    Create a new AutoRed campaign.
    """

    target = (
        db.query(TargetDB)
        .filter(TargetDB.id == target_id)
        .first()
    )

    if target is None:
        raise ValueError("Target not found.")

    if target.status != "ACTIVE":
        raise ValueError("Target is not active.")

    campaign = CampaignDB(
        target_id=target_id,
        objective=objective,
        category=category,
        max_iterations=max_iterations,
        status="CREATED",
        total_iterations=0,
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return campaign


def run_campaign(
    db: Session,
    campaign: CampaignDB,
):
    """
    Run the complete AutoRed campaign.

    The campaign:
    1. Gets the target.
    2. Runs the adaptive AutoRed loop.
    3. Stores every attack.
    4. Stores vulnerabilities as findings.
    5. Stores adaptation reasoning.
    6. Measures attack latency.
    """

    campaign.status = "RUNNING"
    db.commit()

    target_record = (
        db.query(TargetDB)
        .filter(TargetDB.id == campaign.target_id)
        .first()
    )

    if target_record is None:
        campaign.status = "FAILED"
        db.commit()
        raise ValueError("Campaign target not found.")

    try:
        target = create_target_instance(target_record)

        autored = AutoRedOrchestrator(target)

        campaign_start = time.perf_counter()

        results = autored.run_campaign(
            objective=campaign.objective,
            category=campaign.category,
            max_iterations=campaign.max_iterations,
        )

        campaign_duration = time.perf_counter() - campaign_start

        for result in results:

            finding = result["finding"]

            # -------------------------------------------------
            # Attack latency
            # -------------------------------------------------

            latency = result.get("latency", None)

            if latency is None:
                latency = result.get("duration", None)

            if latency is None:
                latency = 0.0

            # -------------------------------------------------
            # Adaptation reason
            # -------------------------------------------------

            adaptation_reason = getattr(
                finding,
                "adaptation_reason",
                None,
            )

            # -------------------------------------------------
            # Store attack
            # -------------------------------------------------

            attack = AttackDB(
                campaign_id=campaign.id,
                iteration=finding.iteration,
                strategy=finding.strategy,
                category=finding.category,
                prompt=finding.prompt,
                target_response=finding.target_response,
                status=finding.status,
                severity=finding.severity,
                confidence=str(finding.confidence),
                reason=finding.reason,
                adaptation_reason=adaptation_reason,
            )

            db.add(attack)
            db.flush()

            # -------------------------------------------------
            # Store vulnerability finding
            # -------------------------------------------------

            if finding.is_vulnerability():

                finding_record = FindingDB(
                    campaign_id=campaign.id,
                    attack_id=attack.id,
                    category=finding.category,
                    severity=finding.severity,
                    confidence=str(finding.confidence),
                    title=(
                        f"{finding.category.replace('_', ' ').title()} "
                        f"Detected"
                    ),
                    reason=finding.reason,
                    evidence=(
                        f"PROMPT:\n{finding.prompt}\n\n"
                        f"TARGET RESPONSE:\n{finding.target_response}"
                    ),
                )

                db.add(finding_record)

        campaign.total_iterations = len(results)
        campaign.status = "COMPLETED"

        db.commit()

        return {
            "campaign_id": campaign.id,
            "status": campaign.status,
            "total_iterations": len(results),
            "campaign_duration": round(campaign_duration, 4),
            "results": results,
        }

    except Exception:

        campaign.status = "FAILED"
        db.commit()

        raise