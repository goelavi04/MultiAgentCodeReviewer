import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import CodeReviewRequest, CodeReviewResponse, AgentReview, Severity
from graph.review_graph import build_review_graph

load_dotenv()

review_graph = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global review_graph
    review_graph = build_review_graph()
    yield


app = FastAPI(title="CodeSentinel API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://csentinel.vercel.app",
        "https://codesentinel-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "service": "CodeSentinel"}


@app.post("/api/review", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest) -> CodeReviewResponse:
    if not request.code.strip():
        raise HTTPException(status_code=422, detail="Code cannot be empty")

    start = time.perf_counter()

    try:
        result = review_graph.invoke({
            "code": request.code,
            "language": request.language,
            "security_review": None,
            "style_review": None,
            "logic_review": None,
            "final_verdict": None,
            "overall_severity": None,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")

    duration_ms = (time.perf_counter() - start) * 1000

    def parse_review(raw: dict, fallback_name: str) -> AgentReview:
        if not raw:
            return AgentReview(
                agent_name=fallback_name,
                findings="Agent did not return a result.",
                severity=Severity.LOW,
                suggestions=[],
            )
        return AgentReview(
            agent_name=raw.get("agent_name", fallback_name),
            findings=raw.get("findings", ""),
            severity=Severity(raw.get("severity", "LOW")),
            suggestions=raw.get("suggestions", []),
        )

    return CodeReviewResponse(
        security_review=parse_review(result.get("security_review"), "Security Agent"),
        style_review=parse_review(result.get("style_review"), "Style Agent"),
        logic_review=parse_review(result.get("logic_review"), "Logic Agent"),
        final_verdict=result.get("final_verdict", "No verdict produced."),
        overall_severity=Severity(result.get("overall_severity", "LOW")),
        duration_ms=round(duration_ms, 1),
    )
