import { useEffect, useState } from 'react'

const BADGE_LABELS = {
  ladainha: 'Ladainha',
  quadra: 'Quadra',
  popular: 'Popular',
  traditional: 'Traditional',
}
import { useNavigate } from 'react-router-dom'
import songsData from '../data/songs.json'
import styles from './SongsPage.module.scss'

export default function SongsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? songsData.filter(s => s.title.toLowerCase().includes(q))
    : songsData

  return (
    <div className="page">
      <div className={styles.header}>
        <h2>שירים</h2>
        <div className={styles.searchRow}>
          <input
            className={styles.search}
            type="search"
            placeholder="חיפוש שיר..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            dir="auto"
          />
        </div>
      </div>
      <div className={styles.list}>
        {filtered.length > 0 ? filtered.map(song => (
          <button key={song.id} className={styles.songBtn} onClick={() => navigate(`/songs/${song.id}`)}>
            <span className={styles.songTitle} dir="ltr" lang="pt">{song.title}</span>
            {song.badge && (
              <span className={`${styles.badge} ${styles[`badge_${song.badge}`]}`}>
                {BADGE_LABELS[song.badge]}
              </span>
            )}
          </button>
        )) : (
          <p className={styles.empty}>לא נמצאו שירים עבור "{query}"</p>
        )}
      </div>
    </div>
  )
}
