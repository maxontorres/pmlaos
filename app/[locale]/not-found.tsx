import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import styles from './not-found.module.css'

export default async function NotFoundPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('notFound')

  return (
    <div className={styles.container}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.desc}>{t('description')}</p>
      <div className={styles.actions}>
        <Link href={`/${locale}/`} className={styles.primary}>
          {t('home')}
        </Link>
        <Link href={`/${locale}/listings`} className={styles.secondary}>
          {t('listings')}
        </Link>
      </div>
    </div>
  )
}
