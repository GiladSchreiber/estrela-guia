import styles from './TenseSelector.module.scss'

export default function TenseSelector({ tenses, selectedId, onChange, disabled }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        {tenses.map(tense => (
          <button
            key={tense.id}
            className={`${styles.tab} ${selectedId === tense.id ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
            onClick={() => !disabled && onChange(tense.id)}
            disabled={disabled}
          >
            <span className={styles.nameHe}>{tense.nameHe}</span>
            <span className={styles.namePt}>{tense.namePt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
