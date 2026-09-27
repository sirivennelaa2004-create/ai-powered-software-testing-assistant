from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False, index=True)  # requirement, bug
    requirement_id = Column(Integer, ForeignKey("requirements.id", ondelete="CASCADE"), nullable=True)
    bug_report_id = Column(Integer, ForeignKey("bug_reports.id", ondelete="CASCADE"), nullable=True)

    raw_response = Column(Text, nullable=True)
    structured_result = Column(JSON, nullable=False)
    provider = Column(String, default="mock")
    tokens_used = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    bug_report = relationship("BugReport", back_populates="ai_analyses")
