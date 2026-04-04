'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>PM Real Estate</h1>
        <p className={styles.subtitle}>Admin Panel</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={styles.input}
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
