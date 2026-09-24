from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from backend.database.database import Base


class CampaignDB(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, nullable=False)
    objective = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    max_iterations = Column(Integer, nullable=False)
    status = Column(String(50), default="CREATED")
    total_iterations = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class AttackDB(Base):
    __tablename__ = "attacks"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, nullable=False)

    iteration = Column(Integer, nullable=False)

    strategy = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)

    prompt = Column(Text, nullable=False)
    target_response = Column(Text, nullable=False)

    status = Column(String(50), nullable=False)
    severity = Column(String(50), nullable=False)
    confidence = Column(String(20), nullable=False)

    reason = Column(Text, nullable=False)

    # NEW:
    # Explains how the current attack was adapted
    # based on previous evaluator feedback.
    adaptation_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class TargetDB(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    target_type = Column(String(50), nullable=False)
    endpoint = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)


class FindingDB(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, nullable=False)
    attack_id = Column(Integer, nullable=False)

    category = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    confidence = Column(String(20), nullable=False)

    title = Column(String(300), nullable=False)
    reason = Column(Text, nullable=False)
    evidence = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)