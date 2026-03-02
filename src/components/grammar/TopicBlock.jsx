import { Link } from 'react-router-dom'
import BlockTable from './BlockTable'
import styles from './TopicBlock.module.scss'

function renderLines(text) {
  if (!text.includes('\n')) return text
  return text.split('\n').map((line, i) => (
    <span key={i} dir="auto" style={{ display: 'block' }}>{line}</span>
  ))
}

export default function TopicBlock({ block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className={styles.paragraph}>{renderLines(block.he)}</p>
    case 'table':
      return <BlockTable block={block} />
    case 'note':
      return (
        <div className={styles.note}>
          <span className={styles.noteIcon}>💡</span>
          <span>
            {renderLines(block.he)}
            {block.links && (
              <span className={styles.noteLinks}>
                {block.links.map((l, i) => (
                  <Link key={i} to={l.path} className={styles.noteLink}>{l.label}</Link>
                ))}
              </span>
            )}
          </span>
        </div>
      )
    default:
      return null
  }
}
