import { useEffect, useRef } from 'react'

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
]

const PLACEHOLDER = `# Paste your code here...
def authenticate(username, password):
    query = f"SELECT * FROM users WHERE user='{username}'"
    result = db.execute(query)
    if result:
        return True`

export default function CodeInput({ code, setCode, language, setLanguage, isLoading, onSubmit }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!isLoading && code.trim()) onSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isLoading, code, onSubmit])

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[0.6rem] text-white/20 tracking-[0.12em] uppercase">
          Code Input
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isLoading}
          className="font-mono text-[0.6rem] bg-[#818cf8]/10 border border-[#818cf8]/20 text-[#a5b4fc]
                     px-2 py-[3px] rounded cursor-pointer disabled:opacity-50
                     hover:bg-[#818cf8]/[0.18] transition-colors focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value} className="bg-[#0c0c16] text-[#a5b4fc]">
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative flex-1 min-h-[300px]">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={PLACEHOLDER}
          disabled={isLoading}
          spellCheck={false}
          className="w-full h-full min-h-[300px] bg-white/[0.02] border border-white/[0.04] rounded-lg p-4
                     font-mono text-[0.72rem] leading-[1.7] text-white/60 placeholder-white/20 resize-none
                     focus:outline-none focus:border-[#818cf8]/40 focus:ring-1 focus:ring-[#818cf8]/20
                     disabled:opacity-60 transition-colors hover:border-white/[0.08]"
        />
        <div className="absolute bottom-3 right-3 text-[0.65rem] font-mono text-white/20 pointer-events-none select-none">
          {code.length > 0 && `${code.split('\n').length} lines`}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading || !code.trim()}
        className="relative overflow-hidden w-full py-3 rounded-lg font-semibold text-white text-[0.82rem]
                   bg-gradient-to-br from-[#6366f1] to-[#7c3aed]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]
                   focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50
                   shadow-lg shadow-indigo-900/30 tracking-[0.01em]"
      >
        {!isLoading && !!code.trim() && <span className="btn-shimmer-sweep" />}
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingDots />
            Analyzing code
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze Code
            <span className="text-[#c7d2fe]/60 text-xs font-normal">⌘↵</span>
          </span>
        )}
      </button>
    </div>
  )
}

function LoadingDots() {
  return (
    <span className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}
