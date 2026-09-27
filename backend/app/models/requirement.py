from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    priority = Column(String, default="Medium")  # High, Medium, Low
    status = Column(String, default="Draft")    # Draft, Reviewed, Approved, Archived
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    project = relationship("Project", back_populates="requirements")
    creator = relationship("User", back_populates="requirements")
    scenarios = relationship("TestScenario", back_populates="requirement", cascade="all, delete-orphan")
    test_cases = relationship("TestCase", back_populates="requirement", cascade="all, delete-orphan")
