import { useLocation, Link } from 'react-router-dom'
import NavMenu from './NavMenu'
import styles from './Header.module.scss'

export default function Header() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/"><img src="/Quilombo_Logo.svg" alt="Quilombo" className={styles.logo} /></Link>
        {!isHome && <NavMenu />}
      </div>
    </header>
  )
}
