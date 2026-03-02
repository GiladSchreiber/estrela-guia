import styles from './VerbSelector.module.scss'

export default function VerbSelector({ verbs, selectedId, onChange, disabled }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        {verbs.map(verb => (
          <button
            key={verb.id}
            className={`${styles.chip} ${selectedId === verb.id ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
            onClick={() => !disabled && onChange(verb.id)}
            disabled={disabled}
          >
            <span className={styles.namePt}>{verb.namePt}</span>
            <span className={styles.nameHe}>{verb.nameHe}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
