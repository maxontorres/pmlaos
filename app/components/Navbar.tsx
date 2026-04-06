import Link from 'next/link'
import styles from './Navbar.module.css'

interface Props {
  locale: string
}

const links = {
  lo: [
    { href: 'listings', label: 'ລາຍການ' },
    { href: 'about', label: 'ກ່ຽວກັບ' },
    { href: 'contact', label: 'ຕິດຕໍ່' },
  ],
  en: [
    { href: 'listings', label: 'Listings' },
    { href: 'about', label: 'About' },
    { href: 'contact', label: 'Contact' },
  ],
  zh: [
    { href: 'listings', label: '房源' },
    { href: 'about', label: '关于' },
    { href: 'contact', label: '联系' },
  ],
}

const nextLocaleMap: Record<string, { locale: string; label: string }> = {
  en: { locale: 'lo', label: 'ລາວ' },
  lo: { locale: 'zh', label: '中文' },
  zh: { locale: 'en', label: 'EN' },
}

export default function Navbar({ locale }: Props) {
  const navLinks = links[locale as keyof typeof links] ?? links.en
  const next = nextLocaleMap[locale] ?? nextLocaleMap.en

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href={`/${locale}`} className={styles.logo}>
          <svg
            className={styles.logoMark}
            viewBox="0 0 38 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="PM Real Estate"
            role="img"
          >
            <path
              d="M19 2L4 8v14c0 10 6.5 18.4 15 20.8C28.5 40.4 35 32 35 22V8L19 2z"
              fill="#132240"
              stroke="#C9A84C"
              strokeWidth="1.5"
            />
            <text
              x="19"
              y="22"
              textAnchor="middle"
              fontFamily="Cormorant Garamond, serif"
              fontSize="14"
              fontWeight="600"
              fill="#C9A84C"
            >
              PM
            </text>
          </svg>
        </Link>

        <ul className={styles.links}>
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={`/${locale}/${href}`} className={styles.link}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href={`/${next.locale}`} className={styles.langSwitch}>
          {next.label}
        </Link>
      </nav>
    </header>
  )
}
