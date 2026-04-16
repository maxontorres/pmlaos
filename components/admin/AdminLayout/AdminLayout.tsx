'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
      },
      {
        label: 'Villages',
        href: '/admin/villages',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        ),
      },
    ],
  },
  {
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
      },
      {
        label: 'Deals',
        href: '/admin/deals',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      },
    ],
  },
]

const footerNavItem: NavItem = {
  label: 'Users',
  href: '/admin/users',
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6" />
      <path d="M17 11h6" />
    </svg>
  ),
}

const mobileNavItems: NavItem[] = [
  navSections[0].items[0],
  navSections[1].items[0],
  navSections[1].items[1],
  navSections[2].items[0],
  navSections[2].items[1],
]

interface AdminLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    role: string
    image?: string | null
  }
  pageTitle: string
  pageDescription?: string
}

export default function AdminLayout({ children, user, pageTitle, pageDescription }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDesktop, setIsDesktop] = useState(false)
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isActiveRoute = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href))

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/admin/login')
    router.refresh()
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 900px)')
    const syncDesktop = (event?: MediaQueryList | MediaQueryListEvent) => {
      const matches = 'matches' in (event ?? mediaQuery) ? (event ?? mediaQuery).matches : mediaQuery.matches
      setIsDesktop(matches)
      if (matches) {
        setMobileSidebarOpen(false)
      }
    }

    syncDesktop(mediaQuery)
    mediaQuery.addEventListener('change', syncDesktop)

    return () => {
      mediaQuery.removeEventListener('change', syncDesktop)
    }
  }, [])

  useEffect(() => {
    if (!mobileSidebarOpen || isDesktop) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isDesktop, mobileSidebarOpen])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const closeMobileSidebar = () => {
    if (!isDesktop) setMobileSidebarOpen(false)
  }

  const sidebarVisible = isDesktop ? true : mobileSidebarOpen

  return (
    <div
      className={[
        styles.layout,
        isDesktop && desktopSidebarExpanded ? styles.layoutWithSidebar : '',
        isDesktop && !desktopSidebarExpanded ? styles.layoutWithCollapsedSidebar : '',
        isDesktop && !desktopSidebarExpanded ? styles.desktopSidebarCollapsed : '',
      ].filter(Boolean).join(' ')}
    >
      {!isDesktop && mobileSidebarOpen ? (
        <button
          type="button"
          className={styles.sidebarBackdrop}
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <aside className={`${styles.sidebar} ${sidebarVisible ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          {isDesktop && (
            <img 
              src="/img/pmlaos-logo-no-bg.png" 
              alt="PM Real Estate Logo" 
              className={styles.logoImage}
            />
          )}
          <div className={styles.logoCopy}>
            <p className={styles.logoText}>PM Real Estate</p>
            <p className={styles.logoSub}>Admin Panel</p>
          </div>
          <button
            type="button"
            className={styles.sidebarToggleButton}
            aria-label={desktopSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={desktopSidebarExpanded}
            onClick={() => setDesktopSidebarExpanded((current) => !current)}
          >
            {desktopSidebarExpanded ? (
              <span className={styles.closeIcon}>×</span>
            ) : (
              <span className={styles.menuIcon}>
                <span />
                <span />
                <span />
              </span>
            )}
          </button>
        </div>

        <nav className={styles.nav}>
          {navSections.map((section, idx) => (
            <div key={idx} className={styles.navSection}>
              {section.label && <p className={styles.navLabel}>{section.label}</p>}
              {section.items.map((item) => {
                const isActive = isActiveRoute(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    onClick={closeMobileSidebar}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navText}>{item.label}</span>
                    {item.badge !== undefined && <span className={styles.badge}>{item.badge}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          {user.role === 'admin' && (
            <Link
              href={footerNavItem.href}
              className={`${styles.navLink} ${styles.footerNavLink} ${isActiveRoute(footerNavItem.href) ? styles.active : ''}`}
              onClick={closeMobileSidebar}
            >
              <span className={styles.navIcon}>{footerNavItem.icon}</span>
              <span className={styles.navText}>{footerNavItem.label}</span>
            </Link>
          )}
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user.image ? (
                <img src={user.image} alt={user.name} className={styles.avatarImage} />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userRole}>{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className={styles.navText}>Logout</span>
          </button>
          <p className={styles.footerNote}>Internal admin workspace.</p>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>{pageTitle}</h1>
            {pageDescription ? <p className={styles.headerDescription}>{pageDescription}</p> : null}
          </div>
          {!isDesktop && (
            <button
              type="button"
              className={styles.mobileMenuButton}
              aria-label="Open menu"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <span className={styles.menuIcon}>
                <span />
                <span />
                <span />
              </span>
            </button>
          )}
        </header>
        <div className={styles.content}>
          {children}
        </div>
        <nav className={styles.mobileBottomNav} aria-label="Admin mobile navigation">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileBottomLink} ${isActiveRoute(item.href) ? styles.mobileBottomLinkActive : ''}`}
              onClick={closeMobileSidebar}
            >
              <span className={styles.mobileBottomIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
