import Link from 'next/link'
import styles from './Footer.module.css'

interface Props {
  locale: string
}

const content = {
  lo: {
    tagline: 'ອະສັງຫາລິມະຊັບ ວຽງຈັນ',
    links: [
      { href: 'listings', label: 'ລາຍການ' },
      { href: 'about',    label: 'ກ່ຽວກັບ' },
      { href: 'contact',  label: 'ຕິດຕໍ່' },
    ],
    copy: '© 2025 PM Real Estate. ສະຫງວນລິຂະສິດ.',
  },
  en: {
    tagline: 'Property listings in Vientiane, Laos',
    links: [
      { href: 'listings', label: 'Listings' },
      { href: 'about',    label: 'About' },
      { href: 'contact',  label: 'Contact' },
    ],
    copy: '© 2025 PM Real Estate. All rights reserved.',
  },
}

export default function Footer({ locale }: Props) {
  const t = content[locale as keyof typeof content] ?? content.en
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.tagline}>{t.tagline}</p>
        <ul className={styles.links}>
          {t.links.map(({ href, label }) => (
            <li key={href}>
              <Link href={`/${locale}/${href}`} className={styles.link}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.copy}>{t.copy}</p>
      </div>
    </footer>
  )
}
