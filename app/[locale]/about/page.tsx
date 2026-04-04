import { getTranslations, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import styles from './page.module.css'

const team = [
  {
    name: 'Phonesavanh Keovongsa',
    role: 'Principal Agent',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Manivone Phommachak',
    role: 'Senior Agent',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
  },
]

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>{t('title')}</h1>
          <p className={styles.heroSubtitle}>{t('subtitle')}</p>
        </div>
      </section>

      {/* Intro */}
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.introWrap}`}>
          <p className={styles.intro}>{t('introP1')}</p>
          <p className={styles.intro}>{t('introP2')}</p>
        </div>
      </section>

      {/* Why choose us */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('whyTitle')}</h2>
          <div className={styles.whyGrid}>
            {([
              { icon: '📍', title: t('why1Title'), desc: t('why1Desc') },
              { icon: '🤝', title: t('why2Title'), desc: t('why2Desc') },
              { icon: '🌐', title: t('why3Title'), desc: t('why3Desc') },
            ] as const).map(({ icon, title, desc }) => (
              <div key={title} className={styles.whyCard}>
                <span className={styles.whyIcon}>{icon}</span>
                <h3 className={styles.whyTitle}>{title}</h3>
                <p className={styles.whyDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('teamTitle')}</h2>
          <div className={styles.teamGrid}>
            {team.map(({ name, role, photo }) => (
              <div key={name} className={styles.teamCard}>
                <div className={styles.teamPhoto}>
                  <Image src={photo} alt={name} fill style={{ objectFit: 'cover' }} />
                </div>
                <h3 className={styles.teamName}>{name}</h3>
                <p className={styles.teamRole}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
