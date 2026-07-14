import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AGENT_DEFS = [
  { key: 'security_review', label: 'Security Agent', color: '#ef4444' },
  { key: 'style_review', label: 'Style Agent', color: '#818cf8' },
  { key: 'logic_review', label: 'Logic Agent', color: '#22c55e' },
]
const JUDGE_COLOR = '#fbbf24'

const SEVERITY_META = {
  HIGH: { w: '92%', color: '#ef4444', short: 'HIGH' },
  MEDIUM: { w: '55%', color: '#fbbf24', short: 'MED' },
  LOW: { w: '20%', color: '#22c55e', short: 'LOW' },
}

const VERDICT_BADGE = {
  HIGH: { text: 'Do not ship', color: '#ef4444' },
  MEDIUM: { text: 'Fix first', color: '#fbbf24' },
  LOW: { text: 'Ship it', color: '#22c55e' },
}

function chipStyle(color, active) {
  return {
    color: active ? color : 'rgba(255,255,255,0.45)',
    borderColor: active ? `${color}40` : 'rgba(255,255,255,0.08)',
    background: active ? `${color}0d` : 'rgba(255,255,255,0.03)',
  }
}

function Chip({ label, color, active, pulsing, expanded, onClick, disabled }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      animate={pulsing ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
      transition={pulsing ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      className="flex items-center gap-1.5 font-mono text-[0.65rem] px-2.5 py-[5px] rounded-md border transition-colors disabled:cursor-default"
      style={chipStyle(color, active)}
    >
      {label}
      {active && !disabled && (
        <svg
          className="w-2.5 h-2.5 transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </motion.button>
  )
}

function AgentDetail({ review, color }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div
        className="mt-2 rounded-lg border p-3.5 text-[0.78rem] leading-relaxed text-white/50"
        style={{ borderColor: `${color}26`, background: `${color}08` }}
      >
        <p>{review.findings}</p>
        {review.suggestions?.length > 0 && (
          <ul className="mt-2.5 space-y-1.5">
            {review.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-white/45">
                <span style={{ color }} className="mt-0.5 flex-shrink-0">›</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col h-full">
      <div className="text-[0.82rem] font-semibold text-white/70 mb-1">Ready to analyze</div>
      <p className="text-[0.72rem] text-white/[0.28] leading-relaxed mb-3">
        Paste your code and hit Analyze Code to get parallel reviews from all three agents.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {[...AGENT_DEFS.map((a) => ({ label: a.label, color: a.color })), { label: 'Judge Agent', color: JUDGE_COLOR }].map((a) => (
          <div
            key={a.label}
            className="text-[0.65rem] font-mono px-2.5 py-[5px] rounded-md border"
            style={chipStyle(a.color, true)}
          >
            {a.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ error }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center px-6">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-red-400 font-semibold text-sm mb-1.5">Analysis failed</h3>
      <p className="text-white/40 text-xs max-w-sm">{error}</p>
    </div>
  )
}

export default function ReviewResults({ results, isLoading, error }) {
  const [revealCount, setRevealCount] = useState(0)
  const [expanded, setExpanded] = useState(null)
  const timeouts = useRef([])

  useEffect(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    setExpanded(null)

    if (!results) {
      setRevealCount(0)
      return
    }

    setRevealCount(0)
    ;[1, 2, 3, 4].forEach((step, i) => {
      const id = setTimeout(() => setRevealCount(step), 260 * (i + 1))
      timeouts.current.push(id)
    })

    return () => {
      timeouts.current.forEach(clearTimeout)
      timeouts.current = []
    }
  }, [results])

  if (error) return <ErrorState error={error} />
  if (!results && !isLoading) return <EmptyState />

  const overall = results?.overall_severity || 'LOW'
  const badge = VERDICT_BADGE[overall] || VERDICT_BADGE.LOW
  // The judge's raw text often repeats its emoji ship-status line (e.g. "⚠️ Fix first"
  // twice); that status is already shown via the badge below, so drop those lines and
  // any exact duplicates rather than rendering them verbatim.
  const seen = new Set()
  const verdictLines = (results?.final_verdict || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/[✅⚠️🚫]/.test(l))
    .filter((l) => (seen.has(l) ? false : (seen.add(l), true)))
  const headline = verdictLines[0]
  const rest = verdictLines.slice(1)

  return (
    <div className="flex flex-col h-full">
      <div className="text-[0.82rem] font-semibold text-white/70 mb-1">
        {isLoading ? 'Reviewing your code…' : 'Review complete'}
      </div>
      <p className="text-[0.72rem] text-white/[0.28] leading-relaxed mb-3">
        {isLoading
          ? 'Security, Style, and Logic agents are analyzing in parallel.'
          : 'Click an agent to see its full findings and suggestions.'}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {AGENT_DEFS.map((agent, i) => {
          const revealed = isLoading || revealCount > i
          const review = results?.[agent.key]
          const active = !!review && revealCount > i
          return (
            <Chip
              key={agent.key}
              label={agent.label}
              color={review ? SEVERITY_META[review.severity]?.color || agent.color : agent.color}
              active={active}
              pulsing={isLoading && !review}
              expanded={expanded === agent.key}
              disabled={!review || revealCount <= i}
              onClick={() => setExpanded((cur) => (cur === agent.key ? null : agent.key))}
            />
          )
        })}
        <Chip
          label="Judge Agent"
          color={JUDGE_COLOR}
          active={!!results && revealCount > 3}
          pulsing={isLoading && !results}
          expanded={false}
          disabled
          onClick={() => {}}
        />
      </div>

      <AnimatePresence mode="wait">
        {expanded && results?.[expanded] && (
          <AgentDetail
            key={expanded}
            review={results[expanded]}
            color={AGENT_DEFS.find((a) => a.key === expanded)?.color}
          />
        )}
      </AnimatePresence>

      <div className="mt-auto pt-3">
        <AnimatePresence mode="wait">
          {isLoading && !results && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[10px] border border-[#818cf8]/[0.15] bg-[#818cf8]/[0.04] p-4 space-y-2.5"
            >
              <div className="h-3 w-24 rounded shimmer-bg" />
              <div className="h-3 w-full rounded shimmer-bg" />
              <div className="h-3 w-4/5 rounded shimmer-bg" />
              <div className="h-6 w-28 rounded-full shimmer-bg mt-2" />
            </motion.div>
          )}

          {results && revealCount > 3 && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[10px] border border-[#818cf8]/[0.15] bg-[#818cf8]/[0.04] p-4"
            >
              <div
                className="absolute top-0 left-5 right-5 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)' }}
              />
              <div className="font-mono text-[0.58rem] text-[#818cf8]/50 tracking-[0.12em] uppercase mb-2.5">
                Judge verdict
              </div>

              <div className="text-[0.74rem] text-white/[0.38] leading-[1.6] mb-3 space-y-1.5">
                {headline && <p className="text-[#f0eeff] font-semibold text-[0.85rem]">{headline}</p>}
                {rest.map((line, i) => <p key={i}>{line}</p>)}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border"
                  style={{ background: `${badge.color}12`, borderColor: `${badge.color}26` }}
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full"
                    style={{ background: badge.color, animation: 'pulseGlow 2s infinite' }}
                  />
                  <span
                    className="font-mono text-[0.6rem] tracking-[0.08em] uppercase"
                    style={{ color: badge.color }}
                  >
                    {badge.text}
                  </span>
                </div>
                <span className="font-mono text-[0.58rem] text-white/[0.18]">
                  reviewed in {(results.duration_ms / 1000).toFixed(1)}s
                </span>
              </div>

              <div className="flex flex-col gap-[5px]">
                {AGENT_DEFS.map((agent) => {
                  const sev = results[agent.key]?.severity || 'LOW'
                  const meta = SEVERITY_META[sev]
                  const name = agent.label.replace(' Agent', '').toLowerCase()
                  return (
                    <div key={agent.key} className="flex items-center gap-2 font-mono text-[0.6rem] text-white/30">
                      <span className="w-[52px] text-right">{name}</span>
                      <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="sev-fill h-full rounded-full"
                          style={{ '--w': meta.w, background: meta.color }}
                        />
                      </div>
                      <span style={{ color: `${meta.color}99` }} className="text-[0.55rem] w-7">
                        {meta.short}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
