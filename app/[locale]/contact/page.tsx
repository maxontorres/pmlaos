import { getTranslations, setRequestLocale } from 'next-intl/server'
import InquiryForm from '@/components/public/InquiryForm/InquiryForm'
import WhatsAppButton from '@/components/public/WhatsAppButton/WhatsAppButton'
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
            {/* Form */}
            <div className={styles.formWrap}>
              <InquiryForm
                nameLabel={t('contact.form.name')}
                phoneLabel={t('contact.form.phone')}
                messageLabel={t('contact.form.message')}
                submitLabel={t('contact.form.submit')}
                successMessage={t('contact.form.success')}
              />
            </div>

            {/* Sidebar info */}
            <aside className={styles.info}>
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
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
