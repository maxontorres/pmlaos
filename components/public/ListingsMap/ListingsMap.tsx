'use client'

import { useState } from 'react'
import maplibregl from 'maplibre-gl'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import styles from './ListingsMap.module.css'

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
  note: string
  pins: PinItem[]
}

const BASEMAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
} as const

export default function ListingsMap({ note, pins }: Props) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)

  const handlePinClick = (href: string) => {
    window.location.assign(href)
  }

  return (
    <section className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.mapCard}>
          <div className={styles.mapFrame}>
            <Map
              mapLib={maplibregl}
              initialViewState={{
                longitude: 102.61,
                latitude: 17.958,
                zoom: 11.7,
              }}
              minZoom={10.5}
              maxZoom={15.5}
              style={{ width: '100%', height: '100%' }}
              mapStyle={BASEMAP_STYLE}
            >
              <NavigationControl position="top-right" showCompass={false} />

              {pins.map((pin) => (
                <Marker
                  key={pin.slug}
                  longitude={pin.lng}
                  latitude={pin.lat}
                  anchor="bottom"
                >
                  <button
                    type="button"
                    className={`${styles.pinButton} ${pin.active ? styles.pinButtonActive : ''}`}
                    aria-label={pin.title}
                    onClick={() => handlePinClick(pin.href)}
                    onMouseEnter={() => setHoveredPin(pin.slug)}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <span className={styles.pinDot} />
                  </button>
                  {hoveredPin === pin.slug && (
                    <div className={styles.pinTooltip}>
                      {pin.title} · {pin.areaLabel}
                    </div>
                  )}
                </Marker>
              ))}
            </Map>
          </div>
        </div>
        <p className={styles.mapNote}>{note}</p>
      </div>
    </section>
  )
}
