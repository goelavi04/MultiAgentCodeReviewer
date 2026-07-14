const BASE_URL = '/api'

export async function reviewCode(code, language) {
  const res = await fetch(`${BASE_URL}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  })

  if (!res.ok) {
    let message = `Server error: ${res.status}`
    try {
      const err = await res.json()
      message = err.detail || message
    } catch {}
    throw new Error(message)
  }

  return res.json()
}
