import Background from './components/Background'
import CodeInput from './components/CodeInput'
import ReviewResults from './components/ReviewResults'
import { useCodeReview } from './hooks/useCodeReview'

function LogoMark({ className = 'w-[22px] h-[22px]' }) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className}>
      <path d="M11 2L20 7V15L11 20L2 15V7L11 2Z" fill="none" stroke="rgba(129,140,248,0.7)" strokeWidth="1.2" />
      <path d="M11 6L16 9V13L11 16L6 13V9L11 6Z" fill="rgba(129,140,248,0.12)" stroke="rgba(129,140,248,0.3)" strokeWidth="0.8" />
      <circle cx="11" cy="11" r="2" fill="#818cf8" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: '//',
    title: 'Parallel execution',
    desc: "All three agents run simultaneously via LangGraph's fan-out architecture. No waiting for one to finish before the next begins.",
  },
  {
    icon: '[]',
    title: 'Runs on Groq or locally',
    desc: 'Powered by Groq (Llama 3) or Ollama, auto-detected from your .env. Fast cloud inference or fully local — your choice.',
  },
  {
    icon: '=>',
    title: 'Judge synthesis',
    desc: 'A fourth agent reads all three reviews, deduplicates findings, and delivers one clear verdict — ship, fix, or do not ship.',
  },
]

const PILLS = [
  'LangGraph', 'FastAPI', 'Ollama', 'Groq API', 'Llama 3',
  'React + Vite', 'Tailwind CSS', 'Pydantic v2', 'Python 3.12', 'Docker Compose',
]

export default function App() {
  const { code, setCode, language, setLanguage, isLoading, results, error, submitReview } = useCodeReview()

  const scrollTo = (id) => () => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  let statusColor = '#22c55e'
  let statusLabel = 'Ready'
  if (isLoading) {
    statusColor = '#818cf8'
    statusLabel = 'Analyzing'
  } else if (error) {
    statusColor = '#ef4444'
    statusLabel = 'Error'
  } else if (results) {
    statusColor = '#22c55e'
    statusLabel = 'Done'
  }

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0eeff] font-sans">
      <Background />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-4 sm:px-8 py-[0.9rem] backdrop-blur-2xl bg-[#080810]/70 border-b border-white/[0.06] sticky top-0 z-[100]">
          <div className="flex items-center gap-2 font-bold text-[1rem]">
            <LogoMark />
            <div>
              Code<span className="text-[#818cf8]">Sentinel</span>
            </div>
          </div>
          <div className="hidden sm:flex gap-7 text-[0.78rem] text-white/30">
            <a className="cursor-pointer transition-colors hover:text-white/70" onClick={scrollTo('features')}>Architecture</a>
            <a className="cursor-pointer transition-colors hover:text-white/70" onClick={scrollTo('stack')}>Stack</a>
            <a
              className="cursor-pointer transition-colors hover:text-white/70"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
          </div>
          <button
            onClick={scrollTo('app-frame')}
            className="bg-[#818cf8]/10 border border-[#818cf8]/20 text-[#a5b4fc] px-[1.1rem] py-[0.45rem] rounded-md text-[0.78rem] font-semibold cursor-pointer transition-all hover:bg-[#818cf8]/[0.18] hover:text-[#c7d2fe]"
          >
            Get started
          </button>
        </nav>

        {/* Hero */}
        <section className="text-center pt-16 pb-10 px-8 max-w-[960px] mx-auto">
          <h1
            className="font-extrabold leading-[1.1] tracking-[-0.03em] mb-4 animate-fade-up"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
          >
            AI-Powered <span className="text-gradient">Multi-Agent</span>
            <br />
            Code Review
          </h1>
          <p
            className="text-[1rem] text-white/[0.38] max-w-[520px] mx-auto leading-[1.7] font-normal animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            Security, Style, and Logic agents analyze your code in parallel — a Judge synthesizes the final verdict.
          </p>
        </section>

        {/* App shell */}
        <div id="app-frame" className="max-w-[960px] mx-auto px-6 pb-12 animate-fade-up" style={{ animationDelay: '0.18s' }}>
          <div className="bg-[#0c0c16]/90 border border-white/[0.07] rounded-2xl overflow-hidden backdrop-blur-md shadow-[0_0_0_1px_rgba(129,140,248,0.06),0_32px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#080810]/60">
              <div className="flex gap-[5px]">
                <div className="w-[10px] h-[10px] rounded-full bg-[#ef4444]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#f59e0b]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#22c55e]" />
              </div>
              <div className="text-[0.72rem] text-white/25 font-mono tracking-[0.04em]">
                codesentinel · review session
              </div>
              <div className="flex items-center gap-[5px] text-[0.65rem] font-mono" style={{ color: statusColor }}>
                <span
                  className="w-[5px] h-[5px] rounded-full"
                  style={{ background: statusColor, animation: isLoading ? 'pulseGlow 1.2s infinite' : undefined }}
                />
                {statusLabel}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 min-h-[340px]">
              <div className="border-b sm:border-b-0 sm:border-r border-white/5 p-5">
                <CodeInput
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  isLoading={isLoading}
                  onSubmit={submitReview}
                />
              </div>
              <div className="p-5">
                <ReviewResults results={results} isLoading={isLoading} error={error} />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="max-w-[960px] mx-auto px-6 pb-12 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 scroll-mt-20">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#080810] p-6 transition-colors hover:bg-indigo-500/[0.04]">
              <div className="w-8 h-8 rounded-lg bg-[#818cf8]/[0.08] border border-[#818cf8]/[0.12] flex items-center justify-center text-[0.9rem] mb-[0.9rem] font-mono text-[#818cf8]">
                {f.icon}
              </div>
              <div className="text-[0.88rem] font-bold mb-[0.4rem] tracking-[-0.01em]">{f.title}</div>
              <div className="text-[0.74rem] text-white/30 leading-[1.65] font-normal">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Pills */}
        <div id="stack" className="hidden sm:flex max-w-[960px] mx-auto px-6 pb-12 flex-wrap gap-1.5 justify-center scroll-mt-20">
          {PILLS.map((p) => (
            <span
              key={p}
              className="font-mono text-[0.68rem] px-3 py-1.5 border border-white/[0.06] text-white/25 rounded transition-all cursor-default hover:border-[#818cf8]/30 hover:text-[#a5b4fc]/70"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] px-4 sm:px-8 py-5 flex items-center justify-between flex-wrap gap-2 font-mono text-[0.62rem] text-white/[0.15]">
          <div className="flex items-center gap-[7px] font-sans font-bold text-[0.82rem] text-white/50">
            <LogoMark className="w-[15px] h-[15px]" />
            Code<span className="text-[#818cf8]">Sentinel</span>
          </div>
          <span>Groq / Ollama · Your code stays yours</span>
          <span>Powered by LangGraph + FastAPI</span>
        </footer>
      </div>
    </div>
  )
}
