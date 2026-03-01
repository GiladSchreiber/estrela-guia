import { useEffect } from 'react'

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
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="page">
      <div className={styles.header}>
        <h2>שירים</h2>
      </div>
      <div className={styles.list}>
        {songsData.map(song => (
          <button key={song.id} className={styles.songBtn} onClick={() => navigate(`/songs/${song.id}`)}>
            <span className={styles.songTitle} dir="ltr" lang="pt">{song.title}</span>
            {song.badge && (
              <span className={`${styles.badge} ${styles[`badge_${song.badge}`]}`}>
                {BADGE_LABELS[song.badge]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
