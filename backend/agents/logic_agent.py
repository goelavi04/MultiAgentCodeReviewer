import json
import re
from langchain_core.messages import HumanMessage, SystemMessage
from .llm import get_llm

SYSTEM_PROMPT = """You are a logic and correctness code review expert. Analyze the provided code for bugs and logical errors.

Focus areas:
- Edge cases: empty inputs, zero, None/null, negative numbers, large values
- Null/undefined dereferences and missing null checks
- Off-by-one errors in loops and array indexing
- Wrong conditionals: incorrect operators, flipped logic, missing branches
- Infinite loops or missing loop termination conditions
- Race conditions and concurrency bugs
- Resource leaks: unclosed files, connections, or handles
- Incorrect type assumptions or implicit type coercions
- Incorrect error handling or swallowed exceptions

Respond ONLY with valid JSON — no markdown, no code fences, no explanation outside JSON:
{
  "findings": "2-3 sentence overall logic assessment",
  "severity": "LOW|MEDIUM|HIGH",
  "suggestions": [
    "Specific actionable fix 1",
    "Specific actionable fix 2",
    "Specific actionable fix 3"
  ]
}"""


def _parse_llm_json(content: str) -> dict:
    content = content.strip()
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if match:
        content = match.group()
    return json.loads(content)


def run_logic_agent(state: dict) -> dict:
    llm = get_llm()
    code: str = state["code"]
    language: str = state.get("language", "python")

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Review this {language} code for logic bugs and correctness issues:\n\n```{language}\n{code}\n```"),
    ]

    response = llm.invoke(messages)
    data = _parse_llm_json(response.content)

    return {
        "logic_review": {
            "agent_name": "Logic Agent",
            "findings": data["findings"],
            "severity": data["severity"],
            "suggestions": data["suggestions"],
        }
    }
