'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import styles from './layout.module.css'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        label: 'Listings',
        href: '/admin/listings',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
        badge: 12,
      },
      {
        label: 'New Listing',
        href: '/admin/listings/new',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'CRM',
    items: [
      {
        label: 'Clients',
        href: '/admin/clients',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        badge: 8,
      },
      {
        label: 'Inquiries',
        href: '/admin/inquiries',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
        badge: 3,
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'Users',
        href: '/admin/users',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 8a6 6 0 1 1 12 0A6 6 0 0 1 6 8zM2 16c0-3.3 2.7-6 6-6s6 2.7 6 6v2H2v-2z" />
          </svg>
        ),
      },
    ],
  },
]

interface AdminLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    email: string
    role: string
  }
  pageTitle: string
}

export default function AdminLayout({ children, user, pageTitle }: AdminLayoutProps) {
  const pathname = usePathname()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <p className={styles.logoText}>PM Real Estate</p>
          <p className={styles.logoSub}>Admin Panel</p>
        </div>

        <nav className={styles.nav}>
          {navSections.map((section, idx) => (
            <div key={idx} className={styles.navSection}>
              {section.label && <p className={styles.navLabel}>{section.label}</p>}
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {item.label}
                    {item.badge !== undefined && <span className={styles.badge}>{item.badge}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getInitials(user.name)}</div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userRole}>{user.role}</p>
            </div>
          </div>
          <button
            className={styles.signOutBtn}
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{pageTitle}</h1>
          <div className={styles.breadcrumb}>
            <Link href="/admin" className={styles.breadcrumbLink}>Admin</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span>{pageTitle}</span>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
