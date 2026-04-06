'use client'

import { useState } from 'react'
import styles from './RangeSlider.module.css'

interface Props {
  nameMin: string
  nameMax: string
  min: number
  max: number
  step?: number
  defaultMin?: number
  defaultMax?: number
  prefix?: string
  suffix?: string
}

function fmt(val: number, prefix: string, suffix: string): string {
  if (val >= 1_000_000) return `${prefix}${(val / 1_000_000).toFixed(1)}M${suffix}`
  if (val >= 1_000) return `${prefix}${(val / 1_000).toFixed(0)}k${suffix}`
  return `${prefix}${val}${suffix}`
}

export default function RangeSlider({
  nameMin,
  nameMax,
  min,
  max,
  step = 1,
  defaultMin,
  defaultMax,
  prefix = '',
  suffix = '',
}: Props) {
  const [minVal, setMinVal] = useState(
    defaultMin != null ? Math.max(min, Math.min(defaultMin, max)) : min,
  )
  const [maxVal, setMaxVal] = useState(
    defaultMax != null ? Math.min(max, Math.max(defaultMax, min)) : max,
  )

  const minPct = ((minVal - min) / (max - min)) * 100
  const maxPct = ((maxVal - min) / (max - min)) * 100

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - step))}
          className={styles.input}
          style={{ zIndex: minVal >= maxVal - step ? 5 : 3 }}
          aria-label={nameMin}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + step))}
          className={styles.input}
          style={{ zIndex: 4 }}
          aria-label={nameMax}
        />
      </div>
      <div className={styles.labels}>
        <span>{fmt(minVal, prefix, suffix)}</span>
        <span>{fmt(maxVal, prefix, suffix)}</span>
      </div>
      {minVal > min && <input type="hidden" name={nameMin} value={minVal} />}
      {maxVal < max && <input type="hidden" name={nameMax} value={maxVal} />}
    </div>
  )
}
