import styles from './page.module.css'

export default async function HomePage(props: PageProps<'/[locale]'>) {
  const { locale } = await props.params
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {locale === 'lo'
            ? 'ຊອກຫາທີ່ດິນ ແລະ ເຮືອນ ໃນວຽງຈັນ'
            : 'Find Property in Vientiane'}
        </h1>
        <p className={styles.subtitle}>
          {locale === 'lo'
            ? 'ຊື້ ຫຼື ເຊົ່າ ກັບ PM Real Estate'
            : 'Buy or rent with PM Real Estate'}
        </p>
        <a href={`/${locale}/listings`} className={styles.cta}>
          {locale === 'lo' ? 'ເບິ່ງລາຍການ' : 'Browse Listings'}
        </a>
      </div>
    </section>
  )
}
