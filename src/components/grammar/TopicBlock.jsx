import BlockTable from './BlockTable'
import styles from './TopicBlock.module.scss'

export default function TopicBlock({ block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className={styles.paragraph}>{block.he}</p>
    case 'table':
      return <BlockTable block={block} />
    case 'note':
      return (
        <div className={styles.note}>
          <span className={styles.noteIcon}>💡</span>
          <span>{block.he}</span>
        </div>
      )
    default:
      return null
  }
}
