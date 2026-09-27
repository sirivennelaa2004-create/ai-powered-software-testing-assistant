from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class TestExecution(Base):
    __tablename__ = "test_executions"

    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False)
    executed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    execution_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    actual_result = Column(Text, nullable=False)
    status = Column(String, nullable=False)  # Passed, Failed, Blocked
    notes = Column(Text, nullable=True)

    # Relationships
    test_case = relationship("TestCase", back_populates="executions")
    executor = relationship("User", back_populates="executions")
