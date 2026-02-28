import { useNavigate } from 'react-router-dom'
import grammarData from '../data/grammar-topics.json'
import styles from './GrammarPage.module.scss'

export default function GrammarPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className={styles.header}>
        <h2>דקדוק</h2>
      </div>

      <div className={styles.grid}>
        {grammarData.map(topic => (
          <button
            key={topic.id}
            className={styles.card}
            onClick={() => navigate(`/grammar/${topic.id}`)}
          >
            <span className={styles.icon}>{topic.icon}</span>
            <span className={styles.title}>{topic.titleHe}</span>
            <span className={styles.tagline}>{topic.taglineHe}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
