import styles from './Pagination.module.css'

interface Props {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
  prevLabel: string
  nextLabel: string
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)

  return pages
}

export default function Pagination({ currentPage, totalPages, buildHref, prevLabel, nextLabel }: Props) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {currentPage > 1 ? (
        <a href={buildHref(currentPage - 1)} className={styles.btn}>
          {prevLabel}
        </a>
      ) : (
        <span className={`${styles.btn} ${styles.btnDisabled}`}>{prevLabel}</span>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <a
            key={p}
            href={buildHref(p as number)}
            className={`${styles.btn} ${p === currentPage ? styles.btnActive : ''}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </a>
        ),
      )}

      {currentPage < totalPages ? (
        <a href={buildHref(currentPage + 1)} className={styles.btn}>
          {nextLabel}
        </a>
      ) : (
        <span className={`${styles.btn} ${styles.btnDisabled}`}>{nextLabel}</span>
      )}
    </nav>
  )
}
