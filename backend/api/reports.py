from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import (
    CampaignDB,
    TargetDB,
    AttackDB,
    FindingDB,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get("")
def list_reports(
    db: Session = Depends(get_db),
):
    """
    Return a summary of all completed campaigns
    that can be viewed as security reports.
    """

    campaigns = (
        db.query(CampaignDB)
        .order_by(CampaignDB.id.desc())
        .all()
    )

    reports = []

    for campaign in campaigns:

        target = (
            db.query(TargetDB)
            .filter(TargetDB.id == campaign.target_id)
            .first()
        )

        attacks = (
            db.query(AttackDB)
            .filter(
                AttackDB.campaign_id == campaign.id
            )
            .all()
        )

        findings = (
            db.query(FindingDB)
            .filter(
                FindingDB.campaign_id == campaign.id
            )
            .all()
        )

        vulnerable = sum(
            1
            for attack in attacks
            if attack.status == "VULNERABLE"
        )

        safe = sum(
            1
            for attack in attacks
            if attack.status == "SAFE"
        )

        severity_counts = {
            "CRITICAL": 0,
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0,
        }

        for finding in findings:
            severity = finding.severity.upper()

            if severity in severity_counts:
                severity_counts[severity] += 1

        highest_severity = "NONE"

        severity_order = [
            "CRITICAL",
            "HIGH",
            "MEDIUM",
            "LOW",
        ]

        for severity in severity_order:
            if severity_counts[severity] > 0:
                highest_severity = severity
                break

        reports.append(
            {
                "campaign_id": campaign.id,
                "campaign_name": (
                    f"Campaign #{campaign.id}"
                ),
                "target_id": campaign.target_id,
                "target_name": (
                    target.name
                    if target
                    else "Unknown Target"
                ),
                "objective": campaign.objective,
                "category": campaign.category,
                "status": campaign.status,

                "total_attacks": len(attacks),
                "safe_attacks": safe,
                "vulnerable_attacks": vulnerable,

                "total_findings": len(findings),

                "severity_counts": severity_counts,
                "highest_severity": highest_severity,

                "max_iterations": campaign.max_iterations,
                "total_iterations": campaign.total_iterations,

                "created_at": campaign.created_at,
            }
        )

    return {
        "total": len(reports),
        "reports": reports,
    }


@router.get("/{campaign_id}")
def get_report(
    campaign_id: int,
    db: Session = Depends(get_db),
):
    """
    Generate a complete security report for one campaign.
    """

    campaign = (
        db.query(CampaignDB)
        .filter(CampaignDB.id == campaign_id)
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Campaign #{campaign_id} "
                "not found."
            ),
        )

    target = (
        db.query(TargetDB)
        .filter(TargetDB.id == campaign.target_id)
        .first()
    )

    attacks = (
        db.query(AttackDB)
        .filter(
            AttackDB.campaign_id == campaign.id
        )
        .order_by(AttackDB.iteration.asc())
        .all()
    )

    findings = (
        db.query(FindingDB)
        .filter(
            FindingDB.campaign_id == campaign.id
        )
        .order_by(FindingDB.id.asc())
        .all()
    )

    # ---------------------------------------------------------
    # Attack statistics
    # ---------------------------------------------------------

    total_attacks = len(attacks)

    safe_attacks = sum(
        1
        for attack in attacks
        if attack.status == "SAFE"
    )

    vulnerable_attacks = sum(
        1
        for attack in attacks
        if attack.status == "VULNERABLE"
    )

    error_attacks = sum(
        1
        for attack in attacks
        if attack.status == "ERROR"
    )

    # ---------------------------------------------------------
    # Vulnerability / finding statistics
    # ---------------------------------------------------------

    severity_counts = {
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
    }

    for finding in findings:

        severity = finding.severity.upper()

        if severity in severity_counts:
            severity_counts[severity] += 1

    highest_severity = "NONE"

    for severity in [
        "CRITICAL",
        "HIGH",
        "MEDIUM",
        "LOW",
    ]:
        if severity_counts[severity] > 0:
            highest_severity = severity
            break

    # ---------------------------------------------------------
    # Confidence
    # ---------------------------------------------------------

    confidence_values = []

    for attack in attacks:

        try:
            value = float(attack.confidence)

            if 0 <= value <= 1:
                confidence_values.append(value)

        except (TypeError, ValueError):
            continue

    average_confidence = (
        sum(confidence_values)
        / len(confidence_values)
        if confidence_values
        else 0.0
    )

    # ---------------------------------------------------------
    # Attack Success Rate
    # ---------------------------------------------------------

    attack_success_rate = (
        vulnerable_attacks / total_attacks
        if total_attacks > 0
        else 0.0
    )

    # ---------------------------------------------------------
    # Attack timeline
    # ---------------------------------------------------------

    timeline = []

    for attack in attacks:

        timeline.append(
            {
                "id": attack.id,
                "iteration": attack.iteration,
                "strategy": attack.strategy,
                "category": attack.category,

                "status": attack.status,
                "severity": attack.severity,
                "confidence": attack.confidence,

                "prompt": attack.prompt,
                "target_response": (
                    attack.target_response
                ),

                "reason": attack.reason,

                "adaptation_reason": (
                    attack.adaptation_reason
                ),

                "created_at": attack.created_at,
            }
        )

    # ---------------------------------------------------------
    # Findings
    # ---------------------------------------------------------

    finding_list = []

    for finding in findings:

        finding_list.append(
            {
                "id": finding.id,
                "attack_id": finding.attack_id,
                "category": finding.category,
                "severity": finding.severity,
                "confidence": finding.confidence,
                "title": finding.title,
                "reason": finding.reason,
                "evidence": finding.evidence,
                "created_at": finding.created_at,
            }
        )

    # ---------------------------------------------------------
    # Final report
    # ---------------------------------------------------------

    return {
        "report": {

            "campaign": {
                "id": campaign.id,
                "objective": campaign.objective,
                "category": campaign.category,
                "status": campaign.status,
                "max_iterations": (
                    campaign.max_iterations
                ),
                "total_iterations": (
                    campaign.total_iterations
                ),
                "created_at": campaign.created_at,
            },

            "target": {
                "id": target.id if target else None,
                "name": (
                    target.name
                    if target
                    else "Unknown Target"
                ),
                "type": (
                    target.target_type
                    if target
                    else "Unknown"
                ),
                "description": (
                    target.description
                    if target
                    else None
                ),
            },

            "summary": {
                "total_attacks": total_attacks,
                "safe_attacks": safe_attacks,
                "vulnerable_attacks": (
                    vulnerable_attacks
                ),
                "error_attacks": error_attacks,

                "total_findings": len(findings),

                "highest_severity": (
                    highest_severity
                ),

                "average_confidence": round(
                    average_confidence,
                    4,
                ),

                "attack_success_rate": round(
                    attack_success_rate,
                    4,
                ),
            },

            "severity_counts": severity_counts,

            "timeline": timeline,

            "findings": finding_list,
        }
    }