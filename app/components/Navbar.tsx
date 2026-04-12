'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import styles from './Navbar.module.css'
import InstallPWA from '@/components/shared/InstallPWA'

interface Props {
  locale: string
}

const nextLocaleMap: Record<string, { locale: string; label: string }> = {
  en: { locale: 'lo', label: 'ລາວ' },
  lo: { locale: 'zh', label: '中文' },
  zh: { locale: 'en', label: 'EN' },
}

export default function Navbar({ locale }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('nav')
  const next = nextLocaleMap[locale] ?? nextLocaleMap.en

  const navLinks = [
    { href: 'listings', label: t('listings') },
    { href: 'about', label: t('about') },
    { href: 'contact', label: t('contact') },
  ]

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href={`/${locale}`} className={styles.logo}>
          <Image
            src="/img/pmlaos-logo-no-bg.png"
            alt="PM Real Estate"
            width={38}
            height={44}
            className={styles.logoMark}
            priority
          />
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

        <div className={styles.navActions}>
          <InstallPWA />
          <Link href={`/${next.locale}`} className={styles.langSwitch}>
            {next.label}
          </Link>
          
          <button
            className={styles.hamburger}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileLinks}>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={`/${locale}/${href}`}
                  className={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
