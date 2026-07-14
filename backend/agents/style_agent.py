import json
import re
from langchain_core.messages import HumanMessage, SystemMessage
from .llm import get_llm

SYSTEM_PROMPT = """You are a code style and maintainability expert. Analyze the provided code for style and quality issues.

Focus areas:
- Naming conventions (variables, functions, classes — language-idiomatic)
- DRY principle: duplicated logic that should be extracted
- Missing or poor docstrings and comments
- Readability: long functions, deep nesting, unclear intent
- Cyclomatic complexity and cognitive load
- Magic numbers and unexplained constants
- Inconsistent formatting and structure
- Overly complex expressions that could be simplified

Respond ONLY with valid JSON — no markdown, no code fences, no explanation outside JSON:
{
  "findings": "2-3 sentence overall style assessment",
  "severity": "LOW|MEDIUM|HIGH",
  "suggestions": [
    "Specific actionable improvement 1",
    "Specific actionable improvement 2",
    "Specific actionable improvement 3"
  ]
}"""


def _parse_llm_json(content: str) -> dict:
    content = content.strip()
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if match:
        content = match.group()
    return json.loads(content)


def run_style_agent(state: dict) -> dict:
    llm = get_llm()
    code: str = state["code"]
    language: str = state.get("language", "python")

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Review this {language} code for style and maintainability issues:\n\n```{language}\n{code}\n```"),
    ]

    response = llm.invoke(messages)
    data = _parse_llm_json(response.content)

    return {
        "style_review": {
            "agent_name": "Style Agent",
            "findings": data["findings"],
            "severity": data["severity"],
            "suggestions": data["suggestions"],
        }
    }
