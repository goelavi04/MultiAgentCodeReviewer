import { useState, useCallback } from 'react'
import { reviewCode } from '../utils/api'

export function useCodeReview() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const submitReview = useCallback(async () => {
    if (!code.trim()) return
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const data = await reviewCode(code, language)
      setResults(data)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }, [code, language])

  return { code, setCode, language, setLanguage, isLoading, results, error, submitReview }
}
