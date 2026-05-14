import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import sentences from '../data/sentences.json'

export default function SentencesPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/sentences/${sentences[0].id}`, { replace: true })
  }, [])
  return null
}
