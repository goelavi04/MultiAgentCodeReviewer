import json
import re
from langchain_core.messages import HumanMessage, SystemMessage
from .llm import get_llm

SYSTEM_PROMPT = """You are a security code review expert. Analyze the provided code strictly for security vulnerabilities.

Focus areas:
- SQL/command/XSS/SSRF injection vulnerabilities
- Hardcoded secrets, API keys, passwords, tokens
- Unsafe functions: eval, exec, pickle.loads, subprocess with shell=True, os.system
- Missing input validation and sanitization
- Broken authentication or authorization
- Path traversal and directory listing
- Insecure cryptography (MD5, SHA1 for passwords, ECB mode)
- Exposed sensitive data in logs or responses

Respond ONLY with valid JSON — no markdown, no code fences, no explanation outside JSON:
{
  "findings": "2-3 sentence overall security assessment",
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


def run_security_agent(state: dict) -> dict:
    llm = get_llm()
    code: str = state["code"]
    language: str = state.get("language", "python")

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Review this {language} code for security issues:\n\n```{language}\n{code}\n```"),
    ]

    response = llm.invoke(messages)
    data = _parse_llm_json(response.content)

    return {
        "security_review": {
            "agent_name": "Security Agent",
            "findings": data["findings"],
            "severity": data["severity"],
            "suggestions": data["suggestions"],
        }
    }
