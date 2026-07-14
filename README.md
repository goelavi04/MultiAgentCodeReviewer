# CodeSentinel — Multi-Agent AI Code Reviewer

> Paste code. Three AI agents review it in parallel. A Judge delivers the verdict.

```
┌─────────────────────────────────────────────────────────┐
│                     CodeSentinel                         │
│                                                         │
│  ┌──────────┐    ┌──────────────────────────────────┐  │
│  │  React   │───▶│         FastAPI Backend           │  │
│  │ Frontend │    │                                  │  │
│  └──────────┘    │  ┌─────────┐   LangGraph Graph   │  │
│                  │  │  POST   │                      │  │
│                  │  │/api/    │   ┌──────────────┐   │  │
│                  │  │review   │──▶│  Fan-out     │   │  │
│                  │  └─────────┘   │  (parallel)  │   │  │
│                  │                └──────┬───────┘   │  │
│                  │         ┌─────────────┼──────────┐ │  │
│                  │         ▼             ▼          ▼ │  │
│                  │   ┌──────────┐ ┌──────────┐ ┌────┐│  │
│                  │   │Security  │ │  Style   │ │Logic││  │
│                  │   │ Agent    │ │  Agent   │ │Agent││  │
│                  │   └────┬─────┘ └────┬─────┘ └──┬─┘│  │
│                  │        └────────────┴──────────┘  │  │
│                  │                    ▼               │  │
│                  │             ┌─────────────┐        │  │
│                  │             │ Judge Agent │        │  │
│                  │             │  (verdict)  │        │  │
│                  │             └─────────────┘        │  │
│                  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| LLM         | Groq API (`llama3-8b-8192`) / Ollama |
| Agents      | LangGraph (parallel fan-out)        |
| Backend     | FastAPI + Python 3.12               |
| Frontend    | React 19 + Vite + Tailwind CSS      |
| Deploy      | Docker Compose                      |

## Quick Start

### Option A — Groq (Cloud, Recommended)

1. Get a free API key at [console.groq.com](https://console.groq.com)

2. Set your key:
   ```bash
   # backend/.env
   GROQ_API_KEY=gsk_your_key_here
   LLM_PROVIDER=groq
   ```

3. Start the backend:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

4. Start the frontend (new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

---

### Option B — Ollama (Local, No API Key)

1. Install [Ollama](https://ollama.ai) and pull the model:
   ```bash
   ollama pull llama3
   ollama serve   # runs on localhost:11434
   ```

2. Set provider in `backend/.env`:
   ```env
   LLM_PROVIDER=ollama
   GROQ_API_KEY=
   ```

3. Follow steps 3–5 from Option A.

---

### Option C — Docker Compose

```bash
# Edit backend/.env with your GROQ_API_KEY first
docker compose up --build
```

Frontend → [http://localhost:5173](http://localhost:5173)  
Backend API → [http://localhost:8000](http://localhost:8000)

---

## API Reference

### `POST /api/review`

Submit code for multi-agent review.

**Request:**
```json
{
  "code": "def hello(name):\n    print(f'Hello {name}')",
  "language": "python"
}
```

**Response:**
```json
{
  "security_review": {
    "agent_name": "Security Agent",
    "findings": "No critical vulnerabilities found...",
    "severity": "LOW",
    "suggestions": ["Add input validation", "..."]
  },
  "style_review": { "..." },
  "logic_review": { "..." },
  "final_verdict": "The code is clean overall...\n\n✅ Ship it",
  "overall_severity": "LOW",
  "duration_ms": 1842.3
}
```

**Severity levels:** `LOW` | `MEDIUM` | `HIGH`

### `GET /api/health`

```json
{ "status": "ok", "service": "CodeSentinel" }
```

---

## Project Structure

```
MultiAgentCodeReviewer/
├── backend/
│   ├── agents/
│   │   ├── security_agent.py   # Injection, secrets, unsafe functions
│   │   ├── style_agent.py      # Naming, DRY, complexity, readability
│   │   ├── logic_agent.py      # Edge cases, null checks, loops, types
│   │   ├── judge_agent.py      # Synthesizes all reviews → verdict
│   │   └── llm.py              # Groq/Ollama factory
│   ├── graph/
│   │   └── review_graph.py     # LangGraph StateGraph with parallel Send
│   ├── main.py                 # FastAPI app, CORS, /api/review
│   ├── models.py               # Pydantic models
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        │   ├── AgentCard.jsx       # Per-agent result card with severity glow
        │   ├── CodeInput.jsx       # Code editor + language selector
        │   └── ReviewResults.jsx   # Layout + judge verdict section
        ├── hooks/useCodeReview.js  # State + async submitReview()
        ├── utils/api.js            # fetch wrapper
        └── App.jsx                 # Two-panel layout + navbar
```

## Features

- **Parallel agents** — Security, Style, and Logic agents run simultaneously via LangGraph `Send`
- **Judge synthesis** — A fourth agent reads all three reviews and gives a ship/fix/reject verdict
- **Severity badges** — LOW (green) / MEDIUM (amber) / HIGH (red, pulsing glow)
- **Dark premium UI** — Glass-morphism cards, indigo accent, JetBrains Mono code font
- **Mobile responsive** — Single column on mobile, two-panel on desktop
- **Ctrl+Enter** shortcut to submit
- **Skeleton loading** — Shimmer placeholders while agents run
- **Groq + Ollama** — Cloud or local LLM, auto-detected from `.env`
