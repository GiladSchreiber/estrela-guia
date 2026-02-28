import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import categories from '../../data/categories.json'
import styles from './NavMenu.module.scss'

const DURATION = 280 // must match $duration in NavMenu.module.scss

export default function NavMenu() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const pendingPath = useRef(null)
  const navigate = useNavigate()

  const openMenu = () => setOpen(true)

  const closeMenu = (path = null) => {
    pendingPath.current = path
    setClosing(true)
  }

  const handleAnimationEnd = () => {
    if (!closing) return
    setOpen(false)
    setClosing(false)
    if (pendingPath.current) {
      navigate(pendingPath.current)
      pendingPath.current = null
    }
  }

  return (
    <>
      <button className={styles.hamburger} onClick={openMenu} aria-label="תפריט">
        <span />
        <span />
        <span />
      </button>

      {open && (
        <>
          <div
            className={`${styles.overlay} ${closing ? styles.closing : ''}`}
            onClick={() => closeMenu()}
          />
          <div
            className={`${styles.drawer} ${closing ? styles.closing : ''}`}
            onAnimationEnd={handleAnimationEnd}
          >
            <button className={styles.closeBtn} onClick={() => closeMenu()}>✕</button>
            <nav className={styles.nav}>
              {categories.filter(cat => !cat.comingSoon).map((cat) => (
                <button
                  key={cat.id}
                  className={styles.navItem}
                  onClick={() => closeMenu(cat.path)}
                >
                  <span className={styles.navIcon}>{cat.icon}</span>
                  {cat.title}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  )
}
