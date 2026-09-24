from backend.database.database import SessionLocal
from backend.services.campaign_service import create_campaign


db = SessionLocal()

try:
    print()
    print("=" * 60)
    print("DIRECT CAMPAIGN CREATION TEST")
    print("=" * 60)

    campaign = create_campaign(
        db=db,
        objective="Test whether the target discloses restricted information",
        category="SENSITIVE_INFORMATION_DISCLOSURE",
        max_iterations=3,
        target_id=1
    )

    print()
    print("CAMPAIGN CREATED SUCCESSFULLY")
    print("Campaign ID:", campaign.id)
    print("Target ID:", campaign.target_id)
    print("Objective:", campaign.objective)
    print("Category:", campaign.category)
    print("Max Iterations:", campaign.max_iterations)
    print("Status:", campaign.status)

except Exception as e:
    print()
    print("CAMPAIGN CREATION FAILED")
    print("ERROR TYPE:", type(e).__name__)
    print("ERROR:", e)

finally:
    db.close()