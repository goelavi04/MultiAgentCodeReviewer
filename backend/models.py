from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class CodeReviewRequest(BaseModel):
    code: str
    language: str = "python"


class AgentReview(BaseModel):
    agent_name: str
    findings: str
    severity: Severity
    suggestions: List[str]


class CodeReviewResponse(BaseModel):
    security_review: AgentReview
    style_review: AgentReview
    logic_review: AgentReview
    final_verdict: str
    overall_severity: Severity
    duration_ms: float
