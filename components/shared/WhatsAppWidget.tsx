'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import styles from './WhatsAppWidget.module.css'

export default function WhatsAppWidget() {
  const [isHovered, setIsHovered] = useState(false)
  const t = useTranslations('whatsapp')
  
  const phoneNumber = '8562099935869'
  const message = encodeURIComponent(t('defaultMessage'))
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsappWidget}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={t('widgetAria')}
    >
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.icon}
      >
        <path
          fill="#fff"
          d="M16.403,3.002C8.852,3.002,2.726,9.129,2.726,16.681c0,2.423,0.64,4.699,1.753,6.667l-1.841,5.5l5.66-1.814c1.901,1.004,4.052,1.575,6.338,1.575c7.549,0,13.675-6.126,13.675-13.676C28.311,9.129,22.185,3.002,16.403,3.002z M23.537,21.169c-0.317,0.889-1.563,1.629-2.563,1.842c-0.679,0.145-1.563,0.262-4.545-0.946c-3.818-1.547-6.286-5.394-6.476-5.642c-0.181-0.248-1.492-1.987-1.492-3.79c0-1.803,0.946-2.688,1.281-3.054c0.335-0.366,0.732-0.458,0.976-0.458s0.488,0.003,0.701,0.013c0.225,0.011,0.526-0.085,0.823,0.628c0.306,0.732,1.04,2.538,1.132,2.723c0.091,0.185,0.152,0.401,0.03,0.62c-0.122,0.22-0.182,0.357-0.365,0.55c-0.182,0.192-0.384,0.431-0.549,0.579c-0.183,0.165-0.374,0.344-0.161,0.675c0.214,0.331,0.948,1.563,2.034,2.532c1.4,1.247,2.579,1.635,2.945,1.82c0.366,0.184,0.579,0.155,0.792-0.094c0.213-0.249,0.916-1.071,1.161-1.441c0.244-0.37,0.489-0.309,0.826-0.185c0.337,0.123,2.141,1.009,2.508,1.192c0.366,0.185,0.61,0.275,0.702,0.428C23.854,19.956,23.854,20.28,23.537,21.169z"
        />
      </svg>
      {isHovered && (
        <span className={styles.tooltip}>{t('widgetTooltip')}</span>
      )}
    </a>
  )
}
