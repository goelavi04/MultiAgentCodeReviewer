from typing import TypedDict, Optional, List
from langgraph.graph import StateGraph, END, START
from langgraph.constants import Send
from agents.security_agent import run_security_agent
from agents.style_agent import run_style_agent
from agents.logic_agent import run_logic_agent
from agents.judge_agent import run_judge_agent


class ReviewState(TypedDict):
    code: str
    language: str
    security_review: Optional[dict]
    style_review: Optional[dict]
    logic_review: Optional[dict]
    final_verdict: Optional[str]
    overall_severity: Optional[str]


def _fanout(state: ReviewState) -> List[Send]:
    return [
        Send("security_agent", state),
        Send("style_agent", state),
        Send("logic_agent", state),
    ]


def build_review_graph():
    builder = StateGraph(ReviewState)

    builder.add_node("security_agent", run_security_agent)
    builder.add_node("style_agent", run_style_agent)
    builder.add_node("logic_agent", run_logic_agent)
    builder.add_node("judge", run_judge_agent)

    builder.add_conditional_edges(START, _fanout, ["security_agent", "style_agent", "logic_agent"])

    builder.add_edge("security_agent", "judge")
    builder.add_edge("style_agent", "judge")
    builder.add_edge("logic_agent", "judge")
    builder.add_edge("judge", END)

    return builder.compile()
