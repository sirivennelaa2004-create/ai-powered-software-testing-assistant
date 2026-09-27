from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class TestScenario(Base):
    __tablename__ = "test_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    scenario_type = Column(String, default="Positive")  # Positive, Negative, Edge Case, Boundary, Security, Validation
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    requirement = relationship("Requirement", back_populates="scenarios")
    test_cases = relationship("TestCase", back_populates="scenario", cascade="all, delete-orphan")
