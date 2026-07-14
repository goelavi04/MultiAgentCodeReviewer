import json
import re
from langchain_core.messages import HumanMessage, SystemMessage
from .llm import get_llm

SYSTEM_PROMPT = """You are a senior engineering lead synthesizing code review results from three specialist agents.

You will receive findings from a Security Agent, Style Agent, and Logic Agent. Based on their combined assessment:
1. Write an executive summary (3-4 sentences) covering the most critical issues across all three reviews
2. Determine the overall severity (the highest of all three, weighted toward security)
3. Give a clear "ship it?" verdict using exactly one of these options:
   - "✅ Ship it" — minor or no issues, code is production-ready
   - "⚠️ Fix first" — moderate issues that should be addressed before shipping
   - "🚫 Do not ship" — serious issues (HIGH severity security or logic bugs) that must be fixed

Respond ONLY with valid JSON — no markdown, no code fences, no explanation outside JSON:
{
  "final_verdict": "Executive summary paragraph followed by a newline and the verdict on its own line",
  "overall_severity": "LOW|MEDIUM|HIGH",
  "ship_recommendation": "✅ Ship it|⚠️ Fix first|🚫 Do not ship"
}"""


def _parse_llm_json(content: str) -> dict:
    content = content.strip()
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if match:
        content = match.group()
    return json.loads(content)


def _severity_rank(s: str) -> int:
    return {"LOW": 0, "MEDIUM": 1, "HIGH": 2}.get(s.upper(), 0)


def run_judge_agent(state: dict) -> dict:
    llm = get_llm()

    security = state.get("security_review", {})
    style = state.get("style_review", {})
    logic = state.get("logic_review", {})

    review_summary = f"""SECURITY AGENT:
Findings: {security.get('findings', 'N/A')}
Severity: {security.get('severity', 'N/A')}
Suggestions: {'; '.join(security.get('suggestions', []))}

STYLE AGENT:
Findings: {style.get('findings', 'N/A')}
Severity: {style.get('severity', 'N/A')}
Suggestions: {'; '.join(style.get('suggestions', []))}

LOGIC AGENT:
Findings: {logic.get('findings', 'N/A')}
Severity: {logic.get('severity', 'N/A')}
Suggestions: {'; '.join(logic.get('suggestions', []))}"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Synthesize these three code reviews and provide your verdict:\n\n{review_summary}"),
    ]

    response = llm.invoke(messages)
    data = _parse_llm_json(response.content)

    severities = [security.get("severity", "LOW"), style.get("severity", "LOW"), logic.get("severity", "LOW")]
    overall = max(severities, key=_severity_rank)

    verdict_text = data.get("final_verdict", "")
    ship_rec = data.get("ship_recommendation", "⚠️ Fix first")
    full_verdict = f"{verdict_text}\n\n{ship_rec}"

    return {
        "final_verdict": full_verdict,
        "overall_severity": data.get("overall_severity", overall),
    }
