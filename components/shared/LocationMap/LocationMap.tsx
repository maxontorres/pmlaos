'use client'

import maplibregl from 'maplibre-gl'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import styles from './LocationMap.module.css'

type Props = {
  lat: number
  lng: number
  label: string
  note?: string
  showControls?: boolean
  height?: 'compact' | 'default'
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

export default function LocationMap({
  lat,
  lng,
  label,
  note,
  showControls = false,
  height = 'default',
}: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.mapFrame} ${height === 'compact' ? styles.compact : ''}`}>
        <Map
          mapLib={maplibregl}
          initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: 14.5,
          }}
          minZoom={12}
          maxZoom={18}
          style={{ width: '100%', height: '100%' }}
          mapStyle={BASEMAP_STYLE}
        >
          {showControls ? <NavigationControl position="top-right" showCompass={false} /> : null}
          <Marker longitude={lng} latitude={lat} anchor="bottom">
            <div className={styles.pin} aria-label={label} title={label}>
              <span className={styles.pinDot} />
            </div>
          </Marker>
        </Map>
      </div>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  )
}
