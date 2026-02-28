import categories from '../data/categories.json'
import CategoryCard from '../components/shared/CategoryCard'
import styles from './Home.module.scss'

export default function Home() {
  return (
    <div className="page">
      <div className={styles.hero}>
        <h1>Estrela Guia</h1>
        <p>לימוד פורטוגזית לתלמידי סטודיו קילומבו</p>
      </div>
      <div className={styles.grid}>
        {categories.map((cat) => (
          <CategoryCard key={cat.id} {...cat} />
        ))}
      </div>
    </div>
  )
}
