import { getTranslations, setRequestLocale } from 'next-intl/server'
import WhatsAppButton from '@/components/public/WhatsAppButton/WhatsAppButton'
import LocationMap from '@/components/public/LocationMap/LocationMap'
import styles from './page.module.css'

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>{t('contact.title')}</h1>
          <p className={styles.heroSubtitle}>{t('contact.intro')}</p>
        </div>
      </section>

      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.layout}>
            <div className={styles.infoBlock}>
              <h2 className={styles.infoTitle}>{t('contact.officeTitle')}</h2>
              <p className={styles.address}>
                {t('contact.officeAddress').split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h2 className={styles.infoTitle}>{t('contact.whatsappLabel')}</h2>
              <WhatsAppButton label={t('listing.whatsapp')} />
            </div>

            <div className={styles.infoBlock}>
              <h2 className={styles.infoTitle}>{t('contact.emailLabel')}</h2>
              <a href="mailto:contact@pmlaos.com" className={styles.emailLink}>
                contact@pmlaos.com
              </a>
            </div>
          </div>

          <div className={styles.mapSection}>
            <h2 className={styles.mapTitle}>{t('contact.mapTitle')}</h2>
            <LocationMap latitude={17.9757} longitude={102.6331} />
          </div>
        </div>
      </div>
    </div>
  )
}
