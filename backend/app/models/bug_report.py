from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class BugReport(Base):
    __tablename__ = "bug_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    steps_to_reproduce = Column(Text, nullable=True)
    expected_result = Column(Text, nullable=True)
    actual_result = Column(Text, nullable=True)
    environment = Column(String, default="Staging / QA")
    severity = Column(String, default="Medium")  # Critical, High, Medium, Low
    priority = Column(String, default="P2")      # P0, P1, P2, P3
    status = Column(String, default="Open")      # Open, In Progress, Resolved, Closed, Reopened

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    test_case_id = Column(Integer, ForeignKey("test_cases.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    project = relationship("Project", back_populates="bug_reports")
    test_case = relationship("TestCase", back_populates="bug_reports")
    creator = relationship("User", back_populates="bug_reports")
    ai_analyses = relationship("AIAnalysis", back_populates="bug_report", cascade="all, delete-orphan")
