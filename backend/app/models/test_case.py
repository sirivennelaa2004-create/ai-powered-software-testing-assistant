from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    custom_id = Column(String, index=True, nullable=True)  # e.g., TC-101
    title = Column(String, nullable=False, index=True)
    objective = Column(Text, nullable=True)
    preconditions = Column(Text, nullable=True)
    test_data = Column(Text, nullable=True)
    steps = Column(JSON, nullable=False, default=list)  # List of step strings or dicts
    expected_result = Column(Text, nullable=False)
    test_type = Column(String, default="Functional")  # Positive, Negative, Boundary, Edge Case, etc.
    priority = Column(String, default="P2")            # P0, P1, P2, P3
    severity = Column(String, default="Medium")        # Critical, High, Medium, Low
    category = Column(String, default="Functional")
    status = Column(String, default="Not Run")         # Not Run, Passed, Failed, Blocked

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False)
    scenario_id = Column(Integer, ForeignKey("test_scenarios.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    project = relationship("Project", back_populates="test_cases")
    requirement = relationship("Requirement", back_populates="test_cases")
    scenario = relationship("TestScenario", back_populates="test_cases")
    creator = relationship("User", back_populates="test_cases")
    executions = relationship("TestExecution", back_populates="test_case", cascade="all, delete-orphan")
    bug_reports = relationship("BugReport", back_populates="test_case")
