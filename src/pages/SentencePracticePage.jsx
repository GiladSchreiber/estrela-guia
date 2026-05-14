import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import sentences from '../data/sentences.json'
import styles from './SentencePracticePage.module.scss'

function WordChip({ he, pt }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className={styles.chipScene} onClick={() => setFlipped(!flipped)}>
      <div className={`${styles.chip} ${flipped ? styles.chipFlipped : ''}`}>
        <div className={styles.chipFront}>{he}</div>
        <div className={`${styles.chipBack}`} dir="ltr">{pt}</div>
      </div>
    </div>
  )
}

export default function SentencePracticePage() {
  const { sentenceId } = useParams()
  const navigate = useNavigate()
  const [revealed, setRevealed] = useState(false)

  const idx = sentences.findIndex(s => s.id === sentenceId)
  const sentence = sentences[idx]

  useEffect(() => {
    setRevealed(false)
    window.scrollTo(0, 0)
  }, [sentenceId])

  if (!sentence) return <div className="page"><p style={{ padding: 24 }}>לא נמצא</p></div>

  const prev = idx > 0 ? sentences[idx - 1] : null
  const next = idx < sentences.length - 1 ? sentences[idx + 1] : null

  return (
    <div className="page">
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}>→ חזרה</button>
        <span className={styles.counter}>{idx + 1} / {sentences.length}</span>
        <div className={styles.arrows}>
          <button
            className={styles.arrowBtn}
            disabled={!prev}
            onClick={() => prev && navigate(`/sentences/${prev.id}`)}
            aria-label="הקודם"
          >‹</button>
          <button
            className={styles.arrowBtn}
            disabled={!next}
            onClick={() => next && navigate(`/sentences/${next.id}`)}
            aria-label="הבא"
          >›</button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sentenceBox}>
          <p className={styles.label}>עברית</p>
          <p className={styles.heSentence}>{sentence.he}</p>
        </div>

        <div className={styles.section}>
          <p className={styles.label}>אוצר מילים</p>
          <div className={styles.chips} key={sentenceId}>
            {sentence.words.map((w, i) => (
              <WordChip key={`${sentenceId}-${i}`} he={w.he} pt={w.pt} />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.label}>הרכבת המשפט</p>
          <div
            className={`${styles.revealBox} ${revealed ? styles.revealed : ''}`}
            onClick={() => !revealed && setRevealed(true)}
          >
            {revealed ? (
              <p className={styles.ptSentence} dir="ltr" lang="pt">{sentence.pt}</p>
            ) : (
              <>
                <p className={styles.heSentenceDim}>{sentence.he}</p>
                <p className={styles.tapHint}>לחץ לגילוי</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
