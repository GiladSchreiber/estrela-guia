import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import songsData from '../data/songs.json'
import styles from './SongDetailPage.module.scss'

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

function highlightSentence(sentence, markedWords, markedClass) {
  const lower = markedWords.map(w => w.toLowerCase())
  return sentence.split(' ').map((word, i) => {
    const clean = word.replace(/[^a-zA-ZÀ-ÿ]/g, '').toLowerCase()
    return (
      <span key={i}>
        {i > 0 && ' '}
        {lower.includes(clean) ? <mark className={markedClass}>{word}</mark> : word}
      </span>
    )
  })
}

export default function SongDetailPage() {
  const { songId } = useParams()
  const navigate = useNavigate()
  const song = songsData.find(s => s.id === songId)

  const [phase, setPhase] = useState('detail')
  const [quizType, setQuizType] = useState(null)

  const [quizCards, setQuizCards]       = useState([])
  const [quizIndex, setQuizIndex]       = useState(0)
  const [quizRevealed, setQuizRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [total, setTotal]               = useState(0)
  const [wrongCards, setWrongCards]     = useState([])

  const [recapCards, setRecapCards]       = useState([])
  const [recapIndex, setRecapIndex]       = useState(0)
  const [recapRevealed, setRecapRevealed] = useState(false)

  const ANIM_MS = 220
  const [slideStyle, setSlideStyle] = useState({})
  const animLock = useRef(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (phase !== 'results') return
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0
    if (pct >= 70) confetti({ particleCount: pct === 100 ? 200 : 100, spread: 70, origin: { y: 0.6 } })
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!song) return <div className="page"><p style={{ padding: '2rem' }}>שיר לא נמצא</p></div>

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

  const startWordQuiz = () => {
    const cards = shuffle(song.vocab).map(w => ({ ...w, dir: Math.random() < 0.5 ? 'pt' : 'he' }))
    setQuizCards(cards); setTotal(cards.length); setQuizIndex(0)
    setQuizRevealed(false); setCorrectCount(0); setWrongCards([])
    setQuizType('word'); setPhase('quiz'); window.scrollTo(0, 0)
  }

  const startSentenceQuiz = () => {
    const cards = shuffle(song.sentences)
    setQuizCards(cards); setTotal(cards.length); setQuizIndex(0)
    setQuizRevealed(false); setCorrectCount(0); setWrongCards([])
    setQuizType('sentence'); setPhase('quiz'); window.scrollTo(0, 0)
  }

  const markQuiz = (isCorrect) => {
    const newCorrect = correctCount + (isCorrect ? 1 : 0)
    const newWrong = isCorrect ? wrongCards : [...wrongCards, quizCards[quizIndex]]
    if (quizIndex + 1 < quizCards.length) {
      animateCard(() => { setCorrectCount(newCorrect); setWrongCards(newWrong); setQuizIndex(quizIndex + 1); setQuizRevealed(false) })
    } else {
      setCorrectCount(newCorrect); setWrongCards(newWrong); setPhase('results'); window.scrollTo(0, 0)
    }
  }

  const beginRecap = (cards) => {
    setRecapCards(shuffle(cards)); setRecapIndex(0); setRecapRevealed(false)
    setPhase('recap'); window.scrollTo(0, 0)
  }

  const markRecap = (isCorrect) => {
    if (recapIndex + 1 < recapCards.length) {
      animateCard(() => { setRecapIndex(recapIndex + 1); setRecapRevealed(false) })
    } else {
      const remaining = isCorrect ? recapCards.filter((_, i) => i !== recapIndex) : recapCards
      if (remaining.length > 0) beginRecap(remaining)
      else setPhase('results')
    }
  }

  // ── detail ────────────────────────────────────────────────────────
  if (phase === 'detail') {
    const newNotes = song.grammar_notes.filter(n => n.is_new)
    const reminderNotes = song.grammar_notes.filter(n => !n.is_new)
    const hasBoth = newNotes.length > 0 && reminderNotes.length > 0

    return (
      <div className="page">
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/songs')}>→ חזרה</button>
          <h2>{song.title}</h2>
          <div className={styles.headerSpacer} />
        </div>

        <div className={styles.content}>
          {/* Media */}
          <div className={styles.mediaRow}>
            {song.media_url
              ? <a className={styles.mediaBtn} href={song.media_url} target="_blank" rel="noreferrer">▶ האזינו לשיר</a>
              : <span className={styles.mediaBtnDisabled}>▶ האזינו לשיר — בקרוב</span>
            }
          </div>

          {/* Lyrics */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>מילים ומשמעויות</h3>
            <div className={styles.verses}>
              {song.lyrics.map((verse, vi) => (
                <div key={vi} className={styles.verse}>
                  {verse.map((line, li) => (
                    <div key={li} className={styles.lyricLine}>
                      <span className={styles.lyricPt} dir="ltr" lang="pt">{line.pt}</span>
                      <span className={styles.lyricHe} dir="rtl">{line.he}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Grammar notes */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>דקדוק</h3>
            {newNotes.length > 0 && (
              <div className={styles.grammarGroup}>
                {hasBoth && <span className={styles.groupLabel}>✨ חדש</span>}
                {newNotes.map((note, i) => (
                  <div key={i} className={styles.noteCard}>
                    <p className={styles.noteSentence} dir="ltr" lang="pt">
                      {highlightSentence(note.sentence_pt, note.marked_words, styles.marked)}
                    </p>
                    <div className={styles.noteFooter}>
                      <span className={styles.noteLabel}>{note.label_he}</span>
                      {note.topic_id
                        ? <button className={styles.noteLink} onClick={() => navigate(`/grammar/${note.topic_id}`)}>קרא עוד ←</button>
                        : <span className={styles.noteSoon}>בקרוב</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
            {reminderNotes.length > 0 && (
              <div className={styles.grammarGroup}>
                {hasBoth && <span className={styles.groupLabel}>🔄 תזכורת</span>}
                {reminderNotes.map((note, i) => (
                  <div key={i} className={styles.noteCard}>
                    <p className={styles.noteSentence} dir="ltr" lang="pt">
                      {highlightSentence(note.sentence_pt, note.marked_words, styles.marked)}
                    </p>
                    <div className={styles.noteFooter}>
                      <span className={styles.noteLabel}>{note.label_he}</span>
                      {note.topic_id
                        ? <button className={styles.noteLink} onClick={() => navigate(`/grammar/${note.topic_id}`)}>קרא עוד ←</button>
                        : <span className={styles.noteSoon}>בקרוב</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quiz CTA */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>תרגול</h3>
            <div className={styles.quizBtns}>
              <button className={styles.quizWordBtn} onClick={startWordQuiz}>
                💬 מילים ({song.vocab.length})
              </button>
              <button className={styles.quizSentenceBtn} onClick={startSentenceQuiz}>
                📝 משפטים ({song.sentences.length})
              </button>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // ── quiz ──────────────────────────────────────────────────────────
  if (phase === 'quiz' || phase === 'recap') {
    const isRecap = phase === 'recap'
    const card = isRecap ? recapCards[recapIndex] : quizCards[quizIndex]
    const idx = isRecap ? recapIndex : quizIndex
    const total_ = isRecap ? recapCards.length : quizCards.length
    const revealed = isRecap ? recapRevealed : quizRevealed
    const setRevealed = isRecap ? setRecapRevealed : setQuizRevealed
    const progressPct = (idx / total_) * 100

    return (
      <div className="page">
        <div className={styles.quizTopBar}>
          <span className={styles.progressLabel}>{idx + 1} / {total_}</span>
          <div className={styles.progressTrack}>
            <div
              className={isRecap ? styles.progressFillRecap : styles.progressFill}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {!isRecap && <span className={styles.liveScore}>✓ {correctCount}</span>}
          <button className={styles.exitQuizBtn} onClick={() => { setPhase('detail'); window.scrollTo(0, 0) }}>✕ יציאה</button>
        </div>

        <div className={styles.quizCard}>
          <div style={slideStyle} className={styles.cardSlide}>
            {quizType === 'word' && !revealed && (
              <>
                <span className={styles.cardLang}>{card.dir === 'pt' ? 'פורטוגזית' : 'עברית'}</span>
                <span className={styles.wordText}
                      dir={card.dir === 'pt' ? 'ltr' : 'rtl'}
                      lang={card.dir === 'pt' ? 'pt' : undefined}>
                  {card.dir === 'pt' ? card.pt : card.he}
                </span>
                <button className={styles.revealBtn} onClick={() => flipCard(() => setRevealed(true))}>
                  הצג תרגום
                </button>
              </>
            )}
            {quizType === 'word' && revealed && (
              <>
                <span className={styles.cardLang}>{card.dir === 'pt' ? 'עברית' : 'פורטוגזית'}</span>
                <span className={styles.wordText}
                      dir={card.dir === 'pt' ? 'rtl' : 'ltr'}
                      lang={card.dir === 'he' ? 'pt' : undefined}>
                  {card.dir === 'pt' ? card.he : card.pt}
                </span>
              </>
            )}
            {quizType === 'sentence' && !revealed && (
              <>
                <span className={styles.cardLang}>פורטוגזית</span>
                <span className={styles.sentenceText} dir="ltr" lang="pt">{card.pt}</span>
                <button className={styles.revealBtn} onClick={() => flipCard(() => setRevealed(true))}>
                  הצג תרגום
                </button>
              </>
            )}
            {quizType === 'sentence' && revealed && (
              <>
                <span className={styles.sentenceText} dir="ltr" lang="pt">{card.pt}</span>
                <span className={styles.translationText} dir="rtl">{card.he}</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.markRow} style={{ visibility: revealed ? 'visible' : 'hidden' }}>
          <button className={styles.wrongBtn} onClick={() => isRecap ? markRecap(false) : markQuiz(false)}>
            <span className={styles.markIcon}>👎</span> טעיתי
          </button>
          <button className={styles.correctBtn} onClick={() => isRecap ? markRecap(true) : markQuiz(true)}>
            <span className={styles.markIcon}>👍</span> צדקתי
          </button>
        </div>
      </div>
    )
  }

  // ── results ───────────────────────────────────────────────────────
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
          <div className={styles.scoreCaption}>
            {quizType === 'word' ? 'מילים' : 'משפטים'} נכונים מהניסיון הראשון
          </div>
          <div className={styles.scoreBarTrack}>
            <div className={styles.scoreBarFill}
              style={{ width: `${pct}%`, background: pct === 100 ? '#4a7c59' : pct >= 70 ? '#e8c547' : '#e07070' }} />
          </div>
          <div className={styles.scorePct}>{pct}%</div>
          <div className={styles.resultActions}>
            {wrongCards.length > 0 && (
              <button className={styles.retryWrongBtn} onClick={() => beginRecap(wrongCards)}>
                תרגל שוב את {wrongCards.length} {quizType === 'word' ? 'המילים' : 'המשפטים'} שלא ידעת
              </button>
            )}
            <button className={styles.retryBtn} onClick={quizType === 'word' ? startWordQuiz : startSentenceQuiz}>
              נסה שוב
            </button>
            <button className={styles.backBtn} onClick={() => { setPhase('detail'); window.scrollTo(0, 0) }}>
              חזרה לשיר
            </button>
            <button className={styles.backBtn} onClick={() => navigate('/songs')}>
              חזרה לשירים
            </button>
          </div>
        </div>
      </div>
    )
  }
}
