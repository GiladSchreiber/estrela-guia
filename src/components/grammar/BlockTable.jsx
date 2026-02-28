import styles from './BlockTable.module.scss'

export default function BlockTable({ block }) {
  return (
    <div className={styles.wrapper}>
      {block.caption && <p className={styles.caption}>{block.caption}</p>}
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} className={styles[block.columnLangs[i]]}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => {
                  const lang = block.columnLangs[c]
                  return (
                    <td
                      key={c}
                      className={styles[lang]}
                      dir={lang === 'pt' ? 'ltr' : undefined}
                      lang={lang === 'pt' ? 'pt' : undefined}
                    >
                      {cell}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
