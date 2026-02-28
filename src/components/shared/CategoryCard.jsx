import { useNavigate } from 'react-router-dom'
import styles from './CategoryCard.module.scss'

export default function CategoryCard({ id, title, icon, path, comingSoon }) {
  const navigate = useNavigate()

  return (
    <div
      className={`${styles.card} ${styles[id]} ${comingSoon ? styles.disabled : ''}`}
      onClick={() => !comingSoon && navigate(path)}
      role="button"
      tabIndex={comingSoon ? -1 : 0}
      onKeyDown={(e) => !comingSoon && e.key === 'Enter' && navigate(path)}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.title}>{title}</span>
      {comingSoon && <span className={styles.soonBadge}>בקרוב</span>}
    </div>
  )
}
