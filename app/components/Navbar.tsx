import Image from 'next/image'
import Link from 'next/link'
import styles from './Navbar.module.css'

interface Props {
  locale: string
}

const links = {
  lo: [
    { href: 'listings', label: 'ລາຍການ' },
    { href: 'about',    label: 'ກ່ຽວກັບ' },
    { href: 'contact',  label: 'ຕິດຕໍ່' },
  ],
  en: [
    { href: 'listings', label: 'Listings' },
    { href: 'about',    label: 'About' },
    { href: 'contact',  label: 'Contact' },
  ],
  zh: [
    { href: 'listings', label: '房源' },
    { href: 'about',    label: '关于' },
    { href: 'contact',  label: '联系' },
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
  const logoSrc =
    locale === 'lo'
      ? '/img/pmlaos-logo-lao.png'
      : '/img/pmlaos-logo-english.png'

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href={`/${locale}`} className={styles.logo}>
          <Image src={logoSrc} alt="PM Real Estate" width={48} height={48} />
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
