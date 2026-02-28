import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import confetti from 'canvas-confetti'
import vocabData from '../data/vocabulary.json'
import styles from './VocabQuizPage.module.scss'

const PRAISE_PERFECT = ['מושלם לגמרי!', 'מדהים!', 'פנומנלי!']
const PRAISE_HIGH    = ['כל הכבוד!', 'עבודה מצוינת!', 'אחלה תוצאה!']
const PRAISE_MID     = ['יפה מאוד!', 'עבודה טובה!', 'ממשיכים להתקדם!']
const PRAISE_LOW     = ['המשך להתאמן!', 'בפעם הבאה יהיה טוב יותר!', 'כל ניסיון מקדם אותך!']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getPraise(pct) {
  if (pct === 100) return pick(PRAISE_PERFECT)
  if (pct >= 70)  return pick(PRAISE_HIGH)
  if (pct >= 40)  return pick(PRAISE_MID)
  return pick(PRAISE_LOW)
}

const ALL_IDS = vocabData.map(c => c.id)

export default function VocabQuizPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const skipSetup      = !!location.state?.skipSetup
  const preselectedId  = location.state?.categoryId ?? null

  // ── Setup state ──────────────────────────────────────────────
  const [selectedCategories, setSelectedCategories] = useState(() =>
    skipSetup && preselectedId ? new Set([preselectedId]) : new Set(ALL_IDS)
  )
  const [countOption, setCountOption] = useState(10)

  // ── Runtime state ─────────────────────────────────────────────
  const [phase, setPhase] = useState(() => {
    if (!skipSetup || !preselectedId) return 'setup'
    return 'quiz'
  })
  const [words, setWords] = useState(() => {
    if (!skipSetup || !preselectedId) return []
    const cat = vocabData.find(c => c.id === preselectedId)
    return cat ? shuffle(cat.words.map(w => ({ ...w, dir: Math.random() < 0.5 ? 'pt' : 'he' }))) : []
  })
  const [index, setIndex]               = useState(0)
  const [revealed, setRevealed]         = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [originalWrong, setOriginalWrong] = useState([])
  const [total, setTotal]               = useState(() => {
    if (!skipSetup || !preselectedId) return 0
    const cat = vocabData.find(c => c.id === preselectedId)
    return cat ? cat.words.length : 0
  })

  // ── Recap state ───────────────────────────────────────────────
  const [recapWords, setRecapWords]     = useState([])
  const [recapIndex, setRecapIndex]     = useState(0)
  const [recapRevealed, setRecapRevealed] = useState(false)

  // ── Card slide animation ───────────────────────────────────────
  const ANIM_MS = 220
  const [slideStyle, setSlideStyle] = useState({})
  const animLock = useRef(false)

  const animateCard = (onMidpoint) => {
    if (animLock.current) return
    animLock.current = true
    setSlideStyle({ transform: 'translateX(110%)', transition: `transform ${ANIM_MS}ms ease-in` })
    setTimeout(() => {
      setSlideStyle({ transform: 'translateX(-110%)', transition: 'none' })
      onMidpoint()
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSlideStyle({ transform: 'translateX(0)', transition: `transform ${ANIM_MS}ms ease-out` })
        setTimeout(() => { setSlideStyle({}); animLock.current = false }, ANIM_MS)
      }))
    }, ANIM_MS)
  }

  const flipCard = (onMidpoint) => {
    if (animLock.current) return
    animLock.current = true
    setSlideStyle({ transform: 'perspective(600px) rotateY(90deg)', transition: `transform ${ANIM_MS}ms ease-in` })
    setTimeout(() => {
      onMidpoint()
      setSlideStyle({ transform: 'perspective(600px) rotateY(-90deg)', transition: 'none' })
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSlideStyle({ transform: 'perspective(600px) rotateY(0deg)', transition: `transform ${ANIM_MS}ms ease-out` })
        setTimeout(() => { setSlideStyle({}); animLock.current = false }, ANIM_MS)
      }))
    }, ANIM_MS)
  }

  // ── Confetti on results ───────────────────────────────────────
  useEffect(() => {
    if (phase !== 'results') return
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0
    if (pct >= 70) {
      confetti({ particleCount: pct === 100 ? 200 : 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────
  const sourceWords = vocabData
    .filter(c => selectedCategories.has(c.id))
    .flatMap(c => c.words)

  const isAllSelected = selectedCategories.size === ALL_IDS.length

  const toggleCategory = (id) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll   = () => setSelectedCategories(new Set(ALL_IDS))
  const deselectAll = () => setSelectedCategories(new Set())

  // ── Actions ───────────────────────────────────────────────────
  const startQuiz = () => {
    const count = countOption === 'all' ? sourceWords.length : Math.min(countOption, sourceWords.length)
    const selected = shuffle(sourceWords).slice(0, count).map(w => ({ ...w, dir: Math.random() < 0.5 ? 'pt' : 'he' }))
    setWords(selected)
    setTotal(selected.length)
    setIndex(0)
    setRevealed(false)
    setCorrectCount(0)
    setOriginalWrong([])
    setPhase('quiz')
  }

  const markQuiz = (isCorrect) => {
    const newCorrect = correctCount + (isCorrect ? 1 : 0)
    const newWrong   = isCorrect ? originalWrong : [...originalWrong, words[index]]
    if (index + 1 < words.length) {
      animateCard(() => {
        setCorrectCount(newCorrect)
        setOriginalWrong(newWrong)
        setIndex(index + 1)
        setRevealed(false)
      })
    } else {
      setCorrectCount(newCorrect)
      setOriginalWrong(newWrong)
      setPhase('results')
    }
  }

  const beginRecap = (wrongList) => {
    setRecapWords(shuffle(wrongList))
    setRecapIndex(0)
    setRecapRevealed(false)
    setPhase('recap')
  }

  const markRecap = (isCorrect) => {
    if (recapIndex + 1 < recapWords.length) {
      animateCard(() => {
        setRecapIndex(recapIndex + 1)
        setRecapRevealed(false)
      })
    } else {
      const remaining = isCorrect ? recapWords.filter((_, i) => i !== recapIndex) : recapWords
      if (remaining.length > 0) beginRecap(remaining)
      else setPhase('results')
    }
  }

  const retryWrong = () => beginRecap(originalWrong)

  // ── Render: setup ─────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="page">
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/vocabulary')}>→ חזרה</button>
          <h2>בחינה עצמית</h2>
        </div>

        <div className={styles.setup}>
          <section className={styles.setupSection}>
            <div className={styles.setupSectionHead}>
              <h3>קטגוריות</h3>
              {!isAllSelected && (
                <button className={styles.selectAllLink} onClick={selectAll}>בחר הכל</button>
              )}
              {selectedCategories.size > 0 && (
                <button className={styles.selectAllLink} onClick={deselectAll}>בטל הכל</button>
              )}
            </div>
            <div className={styles.pillRow}>
              {vocabData.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.pill} ${selectedCategories.has(cat.id) ? styles.pillActive : ''}`}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.icon} {cat.titleHe}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.setupSection}>
            <h3>כמה מילים?</h3>
            <div className={styles.countRow}>
              {[10, 20, 30, 'all'].map(n => {
                const disabled = n !== 'all' && n > sourceWords.length
                return (
                  <button
                    key={n}
                    className={`${styles.pill} ${countOption === n ? styles.pillActive : ''} ${disabled ? styles.pillDisabled : ''}`}
                    onClick={() => !disabled && setCountOption(n)}
                    disabled={disabled}
                  >
                    {n === 'all' ? `הכל (${sourceWords.length})` : n}
                  </button>
                )
              })}
            </div>
          </section>

          <button className={styles.startBtn} onClick={startQuiz} disabled={selectedCategories.size === 0}>
            התחל בחינה
          </button>
        </div>
      </div>
    )
  }

  // ── Render: quiz ──────────────────────────────────────────────
  if (phase === 'quiz') {
    const word = words[index]
    const progressPct = (index / words.length) * 100
    const showHe = word.dir === 'he'

    return (
      <div className="page">
        <div className={styles.quizTopBar}>
          <span className={styles.progressLabel}>{index + 1} / {words.length}</span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <span className={styles.liveScore}>✓ {correctCount}</span>
          <button className={styles.exitQuizBtn} onClick={() => skipSetup ? navigate('/vocabulary') : setPhase('setup')}>✕ יציאה</button>
        </div>

        <div className={styles.quizCard}>
          <div style={slideStyle} className={styles.cardSlide}>
            <span className={styles.cardLang}>{showHe ? 'עברית' : 'פורטוגזית'}</span>
            <span className={styles.cardWord} dir={showHe ? 'rtl' : 'ltr'} lang={showHe ? 'he' : 'pt'}>
              {showHe ? word.he : word.pt}
            </span>

            {!revealed ? (
              <button className={styles.revealBtn} onClick={() => flipCard(() => setRevealed(true))}>
                הצג תרגום
              </button>
            ) : (
              <div className={styles.translationBlock}>
                <span className={styles.cardLang}>{showHe ? 'פורטוגזית' : 'עברית'}</span>
                <span className={styles.cardTranslation} dir={showHe ? 'ltr' : 'rtl'} lang={showHe ? 'pt' : 'he'}>
                  {showHe ? word.pt : word.he}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.markRow} style={{ visibility: revealed ? 'visible' : 'hidden' }}>
          <button className={styles.wrongBtn} onClick={() => markQuiz(false)}>
            <span className={styles.markIcon}>👎</span> טעיתי
          </button>
          <button className={styles.correctBtn} onClick={() => markQuiz(true)}>
            <span className={styles.markIcon}>👍</span> צדקתי
          </button>
        </div>
      </div>
    )
  }

  // ── Render: recap ─────────────────────────────────────────────
  if (phase === 'recap') {
    const word = recapWords[recapIndex]
    const progressPct = (recapIndex / recapWords.length) * 100

    return (
      <div className="page">
        <div className={styles.quizTopBar}>
          <span className={styles.progressLabel}>{recapIndex + 1} / {recapWords.length}</span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFillRecap} style={{ width: `${progressPct}%` }} />
          </div>
          <button className={styles.exitQuizBtn} onClick={() => skipSetup ? navigate('/vocabulary') : setPhase('setup')}>✕ יציאה</button>
        </div>

        <div className={styles.quizCard}>
          {(() => {
            const showHe = word.dir === 'he'
            return (
              <div style={slideStyle} className={styles.cardSlide}>
                <span className={styles.cardLang}>{showHe ? 'עברית' : 'פורטוגזית'}</span>
                <span className={styles.cardWord} dir={showHe ? 'rtl' : 'ltr'} lang={showHe ? 'he' : 'pt'}>
                  {showHe ? word.he : word.pt}
                </span>

                {!recapRevealed ? (
                  <button className={styles.revealBtn} onClick={() => flipCard(() => setRecapRevealed(true))}>
                    הצג תרגום
                  </button>
                ) : (
                  <div className={styles.translationBlock}>
                    <span className={styles.cardLang}>{showHe ? 'פורטוגזית' : 'עברית'}</span>
                    <span className={styles.cardTranslation} dir={showHe ? 'ltr' : 'rtl'} lang={showHe ? 'pt' : 'he'}>
                      {showHe ? word.pt : word.he}
                    </span>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        <div className={styles.markRow} style={{ visibility: recapRevealed ? 'visible' : 'hidden' }}>
          <button className={styles.wrongBtn} onClick={() => markRecap(false)}>
            <span className={styles.markIcon}>👎</span> טעיתי
          </button>
          <button className={styles.correctBtn} onClick={() => markRecap(true)}>
            <span className={styles.markIcon}>👍</span> צדקתי
          </button>
        </div>
      </div>
    )
  }

  // ── Render: results ───────────────────────────────────────────
  if (phase === 'results') {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0
    const praise = getPraise(pct)

    return (
      <div className="page">
        <div className={styles.results}>
          <div className={styles.praiseText}>{praise}</div>

          <div className={styles.scoreBig}>
            <span className={styles.scoreNum}>{correctCount}</span>
            <span className={styles.scoreSlash}>/</span>
            <span className={styles.scoreTotal}>{total}</span>
          </div>
          <div className={styles.scoreCaption}>מילים נכונות מהניסיון הראשון</div>

          <div className={styles.scoreBarTrack}>
            <div
              className={styles.scoreBarFill}
              style={{ width: `${pct}%`, background: pct === 100 ? '#4a7c59' : pct >= 70 ? '#e8c547' : '#e07070' }}
            />
          </div>
          <div className={styles.scorePct}>{pct}%</div>

          <div className={styles.resultActions}>
            {originalWrong.length > 0 && (
              <button className={styles.retryWrongBtn} onClick={retryWrong}>
                תרגל שוב את {originalWrong.length} המילים שלא ידעת
              </button>
            )}
            <button className={styles.retryBtn} onClick={startQuiz}>נסה שוב</button>
            <button className={styles.backBtn} onClick={() => navigate('/vocabulary')}>
              חזרה לאוצר מילים
            </button>
          </div>
        </div>
      </div>
    )
  }
}
