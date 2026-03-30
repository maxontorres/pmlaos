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
}

export default function Navbar({ locale }: Props) {
  const navLinks = links[locale as keyof typeof links] ?? links.en
  const otherLocale = locale === 'lo' ? 'en' : 'lo'
  const otherLabel  = locale === 'lo' ? 'EN' : 'ລາວ'
  const logoSrc     = locale === 'lo'
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

        <Link href={`/${otherLocale}`} className={styles.langSwitch}>
          {otherLabel}
        </Link>
      </nav>
    </header>
  )
}
