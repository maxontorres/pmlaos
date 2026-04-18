'use client'

import { useRef } from 'react'

export default function AutoSubmitForm({
  children,
  onChange,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      {...props}
      onChange={(e) => {
        onChange?.(e)
        const target = e.target as HTMLElement
        if (target instanceof HTMLInputElement && (target.type === 'radio' || target.type === 'checkbox')) {
          formRef.current?.requestSubmit()
        }
      }}
    >
      {children}
    </form>
  )
}
