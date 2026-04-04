import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  variant?: 'primary' | 'accent' | 'success' | 'danger'
  change?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
}

export default function StatCard({ label, value, icon, variant = 'primary', change }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={`${styles.iconWrapper} ${styles[variant]}`}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
        {change && (
          <span className={`${styles.change} ${styles[change.type]}`}>
            {change.type === 'positive' && '↑'}
            {change.type === 'negative' && '↓'}
            {change.value}
          </span>
        )}
      </div>
    </div>
  )
}
