'use client'

import { useState } from 'react'
import pageStyles from '@/app/[locale]/listings/page.module.css'
import ListingsMap from './ListingsMap'

type PinItem = {
  slug: string
  title: string
  areaLabel: string
  href: string
  active: boolean
  lat: number
  lng: number
}

type Props = {
  initiallyOpen: boolean
  showLabel: string
  hideLabel: string
  note: string
  pins: PinItem[]
}

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)

export default function ListingsMapPanel({
  initiallyOpen,
  showLabel,
  hideLabel,
  note,
  pins,
}: Props) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)

  return (
    <details
      className={pageStyles.mapToggle}
      open={isOpen}
      onToggle={(event) => setIsOpen((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className={pageStyles.mapToggleSummary}>
        <MapIcon />
        <span className={pageStyles.mapToggleLabel}>
          {isOpen ? hideLabel : showLabel}
        </span>
      </summary>

      {isOpen ? (
        <div className={pageStyles.mapToggleBody}>
          <ListingsMap
            note={note}
            pins={pins}
          />
        </div>
      ) : null}
    </details>
  )
}
