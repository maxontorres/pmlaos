import styles from './DeleteConfirmModal.module.css'

type Props = {
  title: string
  itemName: string
  bodyText?: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({
  title,
  itemName,
  bodyText = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className={styles.card}>
        <p className={styles.eyebrow}>{title}</p>
        <h2 id="delete-modal-title" className={styles.title}>{itemName}</h2>
        <p className={styles.body}>{bodyText}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className={styles.confirmButton} onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
