import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import vocabData from '../data/vocabulary.json'
import WordCard from '../components/vocabulary/WordCard'
import styles from './VocabCategoryPage.module.scss'

const ANIM_MS = 220

export default function VocabCategoryPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const category = vocabData.find((c) => c.id === categoryId)
  const [index, setIndex] = useState(0)
  const [slideStyle, setSlideStyle] = useState({})
  const touchStartX = useRef(null)
  const animLock = useRef(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const goTo = (newIndex, dir) => {
    if (animLock.current) return
    const exitX  = dir === 'next' ? '-110%' : '110%'
    const enterX = dir === 'next' ?  '110%' : '-110%'
    animLock.current = true
    setSlideStyle({ transform: `translateX(${exitX})`, transition: `transform ${ANIM_MS}ms ease-in` })
    setTimeout(() => {
      setSlideStyle({ transform: `translateX(${enterX})`, transition: 'none' })
      setIndex(newIndex)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSlideStyle({ transform: 'translateX(0)', transition: `transform ${ANIM_MS}ms ease-out` })
        setTimeout(() => { setSlideStyle({}); animLock.current = false }, ANIM_MS)
      }))
    }, ANIM_MS)
  }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    touchStartX.current = null
    if (delta < -50 && index < category.words.length - 1) goTo(index + 1, 'prev')
    if (delta >  50 && index > 0)                         goTo(index - 1, 'next')
  }

  if (!category) {
    return (
      <div className="page">
        <div className={styles.header}>
          <span className={styles.progress} />
          <p>קטגוריה לא נמצאה</p>
          <button className={styles.back} onClick={() => navigate('/vocabulary')}>
            → חזרה
          </button>
        </div>
      </div>
    )
  }

  const total = category.words.length
  const word = category.words[index]

  return (
    <div className="page">
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/vocabulary')}>
          → חזרה
        </button>
        <h2>{category.titleHe}</h2>
        <button
          className={styles.quizBtn}
          onClick={() => navigate('/vocabulary/quiz', { state: { categoryId: category.id, skipSetup: true } })}
        >
          בחינה
        </button>
      </div>

      <div
        className={styles.cardArea}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={slideStyle}>
          <WordCard key={index} pt={word.pt} he={word.he} />
        </div>
      </div>

      <div className={styles.nav}>
        <button
          className={styles.navBtn}
          onClick={() => index > 0 && goTo(index - 1, 'next')}
          disabled={index === 0}
        >
          הקודם
        </button>
        <div className={styles.dotsGroup}>
          <div className={styles.dots}>
            {Array.from({ length: Math.min(total, 7) }).map((_, i) => {
              const dotIndex = total <= 7 ? i : Math.round((i / 6) * (total - 1))
              const isActive = total <= 7 ? i === index : Math.abs(dotIndex - index) < total / 7
              return <span key={i} className={`${styles.dot} ${isActive ? styles.active : ''}`} />
            })}
          </div>
          <span className={styles.counter}>{index + 1} / {total}</span>
        </div>
        <button
          className={styles.navBtn}
          onClick={() => index < total - 1 && goTo(index + 1, 'prev')}
          disabled={index === total - 1}
        >
          הבא
        </button>
      </div>
    </div>
  )
}
