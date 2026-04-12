import Link from 'next/link'
import { useTranslations } from 'next-intl'
import styles from './Footer.module.css'

interface Props {
  locale: string
}

export default function Footer({ locale }: Props) {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <h3 className={styles.brandName}>PM Real Estate</h3>
            <p className={styles.tagline}>{t('tagline')}</p>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('quickLinks')}</h4>
            <ul className={styles.links}>
              <li>
                <Link href={`/${locale}/listings`} className={styles.link}>
                  {t('listings')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className={styles.link}>
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className={styles.link}>
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('contactTitle')}</h4>
            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>{t('address')}</span>
              </p>
              <p className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>+856 20 99 935 869</span>
              </p>
              <p className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <a href="mailto:contact@pmlaos.com" className={styles.emailLink}>
                  contact@pmlaos.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {currentYear} PM Real Estate. {t('copyright')}
          </p>
          <Link href={`/${locale}/admin/login`} className={styles.staffLink}>
            {t('staffLogin')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
