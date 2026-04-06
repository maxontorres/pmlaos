'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from './GalleryViewer.module.css'

interface Props {
  photos: string[]
  alt: string
}

export default function GalleryViewer({ photos, alt }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(
    () => setLightboxIndex(i => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  )
  const next = useCallback(
    () => setLightboxIndex(i => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     close()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, close, prev, next])

  return (
    <>
      {/* Gallery grid */}
      <div className={styles.gallery}>
        <button
          className={styles.mainPhoto}
          onClick={() => setLightboxIndex(0)}
          aria-label="View photo 1"
        >
          <Image
            src={photos[0]}
            alt={alt}
            fill
            priority
            unoptimized
            sizes="(max-width: 640px) 100vw, 66vw"
            style={{ objectFit: 'cover' }}
          />
          {photos.length > 1 && (
            <span className={styles.photoCount}>1 / {photos.length}</span>
          )}
        </button>
        {photos.length > 1 && (
          <div className={styles.thumbStack}>
            {photos.slice(1).map((src, i) => (
              <button
                key={i}
                className={styles.thumb}
                onClick={() => setLightboxIndex(i + 1)}
                aria-label={`View photo ${i + 2}`}
              >
                <Image
                  src={src}
                  alt={`${alt} photo ${i + 2}`}
                  fill
                  unoptimized
                  sizes="280px"
                  style={{ objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className={styles.overlay}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <div className={styles.lightbox} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={close} aria-label="Close">
              ×
            </button>
            <div className={styles.imageWrap}>
              <Image
                src={photos[lightboxIndex]}
                alt={`${alt} photo ${lightboxIndex + 1}`}
                fill
                sizes="90vw"
                unoptimized
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            {photos.length > 1 && (
              <>
                <button
                  className={`${styles.navBtn} ${styles.navPrev}`}
                  onClick={prev}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  className={`${styles.navBtn} ${styles.navNext}`}
                  onClick={next}
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}
            <p className={styles.lightboxCount}>
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
