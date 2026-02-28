import { useNavigate } from 'react-router-dom'
import vocabData from '../data/vocabulary.json'
import styles from './VocabularyPage.module.scss'

export default function VocabularyPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className={styles.header}>
        <h2>אוצר מילים</h2>
        <button className={styles.quizBtn} onClick={() => navigate('/vocabulary/quiz')}>
          בחן את עצמך
        </button>
      </div>
      <div className={styles.grid}>
        {vocabData.map((cat) => (
          <div
            key={cat.id}
            className={styles.card}
            onClick={() => navigate(`/vocabulary/${cat.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/vocabulary/${cat.id}`)}
          >
            <span className={styles.icon}>{cat.icon}</span>
            <span className={styles.title}>{cat.titleHe}</span>
            <span className={styles.count}>{cat.words.length} מילים</span>
          </div>
        ))}
      </div>
    </div>
  )
}
