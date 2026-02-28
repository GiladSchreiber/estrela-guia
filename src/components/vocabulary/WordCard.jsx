import { useState } from 'react'
import styles from './WordCard.module.scss'

export default function WordCard({ pt, he }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className={styles.scene} onClick={() => setFlipped(!flipped)}>
      <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
        <div className={`${styles.face} ${styles.front}`}>
          <span className={styles.lang}>פורטוגזית</span>
          <span className={styles.word} dir="ltr">{pt}</span>
          <span className={styles.hint}>לחץ לגלות תרגום</span>
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          <span className={styles.lang}>עברית</span>
          <span className={styles.word}>{he}</span>
        </div>
      </div>
    </div>
  )
}
