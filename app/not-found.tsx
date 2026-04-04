import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.desc}>The page you're looking for doesn't exist or has been moved.</p>
      <div className={styles.actions}>
        <Link href="/en/" className={styles.primary}>
          Back to Home
        </Link>
        <Link href="/en/listings" className={styles.secondary}>
          Browse Listings
        </Link>
      </div>
    </div>
  )
}
