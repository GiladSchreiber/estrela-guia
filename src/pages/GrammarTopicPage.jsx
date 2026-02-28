import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import grammarData from '../data/grammar-topics.json'
import TopicBlock from '../components/grammar/TopicBlock'
import styles from './GrammarTopicPage.module.scss'

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

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function getPraise(pct) {
  if (pct === 100) return pick(PRAISE_PERFECT)
  if (pct >= 70)  return pick(PRAISE_HIGH)
  if (pct >= 40)  return pick(PRAISE_MID)
  return pick(PRAISE_LOW)
}

function renderBlankParts(blank_pt, answer, revealed) {
  const parts = blank_pt.split('___')
  if (!revealed) {
    return (
      <span dir="ltr" lang="pt" className={styles.sentenceLtr}>
        {parts[0]}<span className={styles.blank}>___</span>{parts[1]}
      </span>
    )
  }
  return (
    <span dir="ltr" lang="pt" className={styles.sentenceLtr}>
      {parts[0]}<span className={styles.answerFill}>{answer}</span>{parts[1]}
    </span>
  )
}

export default function GrammarTopicPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const topic = grammarData.find(t => t.id === topicId)

  const [phase, setPhase] = useState('learn')

  // ── Quiz state ─────────────────────────────────────────────────
  const [quizSentences, setQuizSentences] = useState([])
  const [index, setIndex]               = useState(0)
  const [revealed, setRevealed]         = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [originalWrong, setOriginalWrong] = useState([])
  const [total, setTotal]               = useState(0)

  // ── Recap state ────────────────────────────────────────────────
  const [recapWords, setRecapWords]       = useState([])
  const [recapIndex, setRecapIndex]       = useState(0)
  const [recapRevealed, setRecapRevealed] = useState(false)

  // ── Animation ──────────────────────────────────────────────────
  const ANIM_MS = 220
  const [slideStyle, setSlideStyle] = useState({})
  const animLock = useRef(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (phase !== 'results') return
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0
    if (pct >= 70) {
      confetti({ particleCount: pct === 100 ? 200 : 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!topic) {
    return (
      <div className="page">
        <p style={{ padding: '2rem' }}>נושא לא נמצא</p>
      </div>
    )
  }

  // ── Animation helpers ─────────────────────────────────────────
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

  // ── Actions ───────────────────────────────────────────────────
  const startQuiz = () => {
    const shuffled = shuffle(topic.sentences)
    setQuizSentences(shuffled)
    setTotal(shuffled.length)
    setIndex(0)
    setRevealed(false)
    setCorrectCount(0)
    setOriginalWrong([])
    setPhase('quiz')
    window.scrollTo(0, 0)
  }

  const markQuiz = (isCorrect) => {
    const newCorrect = correctCount + (isCorrect ? 1 : 0)
    const newWrong   = isCorrect ? originalWrong : [...originalWrong, quizSentences[index]]
    if (index + 1 < quizSentences.length) {
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
      window.scrollTo(0, 0)
    }
  }

  const beginRecap = (wrongList) => {
    setRecapWords(shuffle(wrongList))
    setRecapIndex(0)
    setRecapRevealed(false)
    setPhase('recap')
    window.scrollTo(0, 0)
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

  // ── Render: learn ─────────────────────────────────────────────
  if (phase === 'learn') {
    return (
      <div className="page">
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/grammar')}>→ חזרה</button>
          <h2>{topic.titleHe}</h2>
          <div className={styles.headerSpacer} />
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>הסבר</h3>
            <div className={styles.blocks}>
              {topic.explanation.map((block, i) => (
                <TopicBlock key={i} block={block} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>דוגמאות</h3>
            <div className={styles.examples}>
              {topic.examples.map((ex, i) => (
                <div key={i} className={styles.exampleRow}>
                  <span className={styles.exPt} dir="ltr" lang="pt">{ex.pt}</span>
                  <span className={styles.exHe} dir="rtl">{ex.he}</span>
                </div>
              ))}
            </div>
          </section>

          <button className={styles.startBtn} onClick={startQuiz}>
            💪 בואו נתרגל
          </button>
        </div>
      </div>
    )
  }

  // ── Render: quiz ──────────────────────────────────────────────
  if (phase === 'quiz') {
    const sentence = quizSentences[index]
    const progressPct = (index / quizSentences.length) * 100

    return (
      <div className="page">
        <div className={styles.quizTopBar}>
          <span className={styles.progressLabel}>{index + 1} / {quizSentences.length}</span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <span className={styles.liveScore}>✓ {correctCount}</span>
          <button className={styles.exitQuizBtn} onClick={() => { setPhase('learn'); window.scrollTo(0, 0) }}>✕ יציאה</button>
        </div>

        <div className={styles.quizCard}>
          <div style={slideStyle} className={styles.cardSlide}>
            {!revealed ? (
              <>
                <span className={styles.sentenceText}>
                  {renderBlankParts(sentence.blank_pt, sentence.answer, false)}
                </span>
                {sentence.base && (
                  <span className={styles.baseForm} dir="ltr" lang="pt">{sentence.base}</span>
                )}
                <span className={styles.hintText}>{sentence.instruction}</span>
                <button className={styles.revealBtn} onClick={() => flipCard(() => setRevealed(true))}>
                  הצג תשובה
                </button>
              </>
            ) : (
              <>
                <span className={styles.sentenceText}>
                  {renderBlankParts(sentence.blank_pt, sentence.answer, true)}
                </span>
                <span className={styles.hintText} dir="rtl">{sentence.translation}</span>
              </>
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
    const sentence = recapWords[recapIndex]
    const progressPct = (recapIndex / recapWords.length) * 100

    return (
      <div className="page">
        <div className={styles.quizTopBar}>
          <span className={styles.progressLabel}>{recapIndex + 1} / {recapWords.length}</span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFillRecap} style={{ width: `${progressPct}%` }} />
          </div>
          <button className={styles.exitQuizBtn} onClick={() => { setPhase('learn'); window.scrollTo(0, 0) }}>✕ יציאה</button>
        </div>

        <div className={styles.quizCard}>
          <div style={slideStyle} className={styles.cardSlide}>
            {!recapRevealed ? (
              <>
                <span className={styles.sentenceText}>
                  {renderBlankParts(sentence.blank_pt, sentence.answer, false)}
                </span>
                <span className={styles.hintText}>{sentence.instruction}</span>
                <button className={styles.revealBtn} onClick={() => flipCard(() => setRecapRevealed(true))}>
                  הצג תשובה
                </button>
              </>
            ) : (
              <>
                <span className={styles.sentenceText}>
                  {renderBlankParts(sentence.blank_pt, sentence.answer, true)}
                </span>
                <span className={styles.hintText} dir="rtl">{sentence.translation}</span>
              </>
            )}
          </div>
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
          <div className={styles.scoreCaption}>משפטים נכונים מהניסיון הראשון</div>

          <div className={styles.scoreBarTrack}>
            <div
              className={styles.scoreBarFill}
              style={{ width: `${pct}%`, background: pct === 100 ? '#4a7c59' : pct >= 70 ? '#e8c547' : '#e07070' }}
            />
          </div>
          <div className={styles.scorePct}>{pct}%</div>

          <div className={styles.resultActions}>
            {originalWrong.length > 0 && (
              <button className={styles.retryWrongBtn} onClick={() => beginRecap(originalWrong)}>
                תרגל שוב את {originalWrong.length} המשפטים שלא ידעת
              </button>
            )}
            <button className={styles.retryBtn} onClick={startQuiz}>נסה שוב</button>
            <button className={styles.backBtn} onClick={() => { setPhase('learn'); window.scrollTo(0, 0) }}>
              חזרה להסבר
            </button>
            <button className={styles.backBtn} onClick={() => navigate('/grammar')}>
              חזרה לדקדוק
            </button>
          </div>
        </div>
      </div>
    )
  }
}
