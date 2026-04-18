'use client'

import { FormEvent, useState } from 'react'
import styles from './UsersManager.module.css'

type UserRecord = {
  id: string
  name: string
  email: string
  role: 'admin' | 'agent'
  active: boolean
  image?: string | null
  password?: string | null
  createdAt: Date
  accounts: Array<{ provider: string }>
}

type FormValues = {
  name: string
  email: string
  role: 'admin' | 'agent'
  active: boolean
  password: string
}

const EMPTY_FORM: FormValues = {
  name: '',
  email: '',
  role: 'agent',
  active: true,
  password: '',
}

function sortUsers(items: UserRecord[]) {
  return [...items].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1
    if (a.role !== 'admin' && b.role === 'admin') return 1
    return a.name.localeCompare(b.name)
  })
}

function toFormValues(user: UserRecord): FormValues {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    password: '',
  }
}

export default function UsersManager({ initialUsers }: { initialUsers: UserRecord[] }) {
  const [users, setUsers] = useState<UserRecord[]>(sortUsers(initialUsers))
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase()
    return user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
  })

  function openForm(user?: UserRecord) {
    if (user) {
      setEditingUser(user)
      setFormValues(toFormValues(user))
    } else {
      setEditingUser(null)
      setFormValues(EMPTY_FORM)
    }
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingUser(null)
    setFormValues(EMPTY_FORM)
    setShowPassword(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name: formValues.name,
        email: formValues.email,
        role: formValues.role,
        active: formValues.active,
        password: formValues.password || undefined,
      }

      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update user')
        const updated = await res.json()
        setUsers(prev => sortUsers(prev.map(u => u.id === updated.id ? { ...u, ...updated } : u)))
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Failed to create user')
        }
        const created = await res.json()
        setUsers(prev => sortUsers([...prev, { ...created, accounts: [] }]))
      }
      closeForm()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleActive(user: UserRecord) {
    if (!confirm(`${user.active ? 'Deactivate' : 'Activate'} ${user.name}?`)) return

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      })
      if (!res.ok) throw new Error('Failed to update user')
      const updated = await res.json()
      setUsers(prev => sortUsers(prev.map(u => u.id === updated.id ? { ...u, ...updated } : u)))
    } catch {
      alert('Failed to update user status')
    }
  }

  async function handleDelete(user: UserRecord) {
    if (!confirm(`Delete ${user.name}? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete user')
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch {
      alert('Failed to delete user')
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.toolbar}>
        <div className={styles.toolbarIntro}>
          <p className={styles.toolbarEyebrow}>Users manager</p>
          <p className={styles.toolbarText}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} · manage access
          </p>
        </div>
        <button type="button" onClick={() => openForm()} className={styles.primaryButton}>
          + Add user
        </button>
      </section>

      <section className={styles.filtersPanel}>
        <label className={styles.searchField}>
          <span className={styles.searchLabel}>Search users</span>
          <input
            type="search"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </label>
      </section>

      {isFormOpen && (
        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <button type="button" onClick={closeForm} className={styles.backButton}>
              Back
            </button>
            <div>
              <h2 className={styles.formTitle}>
                {editingUser ? 'Edit user' : 'Add new user'}
              </h2>
              <p className={styles.formText}>Manage admin and agent access to the system.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <input
                type="text"
                required
                value={formValues.name}
                onChange={e => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                className={styles.input}
                placeholder="Full name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email *</label>
              <input
                type="email"
                required
                value={formValues.email}
                onChange={e => setFormValues(prev => ({ ...prev, email: e.target.value.toLowerCase() }))}
                className={styles.input}
                disabled={!!editingUser}
                placeholder="email@example.com"
              />
              {editingUser && (
                <span className={styles.hint}>Email cannot be changed after creation</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password {!editingUser && '*'}</label>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!editingUser}
                  value={formValues.password}
                  onChange={e => setFormValues(prev => ({ ...prev, password: e.target.value }))}
                  className={styles.input}
                  placeholder={editingUser ? 'Leave empty to keep current' : 'Set a password'}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {editingUser && (
                <span className={styles.hint}>Leave empty to keep current password</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Role *</label>
              <select
                required
                value={formValues.role}
                onChange={e => setFormValues(prev => ({ ...prev, role: e.target.value as 'admin' | 'agent' }))}
                className={styles.select}
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={formValues.active}
                onChange={e => setFormValues(prev => ({ ...prev, active: e.target.checked }))}
                className={styles.checkbox}
              />
              <span>Active (can log in)</span>
            </label>

            <div className={styles.stickyActions}>
              <button type="button" onClick={closeForm} className={styles.secondaryButton}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className={styles.primaryButton}>
                {isSubmitting ? 'Saving...' : editingUser ? 'Save changes' : 'Create user'}
              </button>
            </div>
          </form>
        </section>
      )}

      {filteredUsers.length === 0 ? (
        <article className={styles.emptyCard}>
          <div className={styles.emptyIcon}>👥</div>
          <h2 className={styles.emptyTitle}>
            {users.length === 0 ? 'No users yet' : 'No matching users'}
          </h2>
          <p className={styles.emptyText}>
            {users.length === 0
              ? 'Create the first user to grant system access.'
              : 'Try another search term.'}
          </p>
        </article>
      ) : (
        <section className={styles.recordList}>
          {filteredUsers.map(user => {
            const hasGoogleAuth = user.accounts.some(acc => acc.provider === 'google')
            const hasPassword = user.password !== null

            return (
              <article key={user.id} className={styles.recordCard}>
                <div className={styles.recordTop}>
                  <div className={styles.recordIdentity}>
                    {user.image ? (
                      <img src={user.image} alt={user.name} className={styles.avatar} />
                    ) : (
                      <div className={styles.avatarInitials}>
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className={styles.recordTitle}>{user.name}</h2>
                      <p className={styles.recordSubtle}>{user.email}</p>
                    </div>
                  </div>
                  <div className={styles.recordBadgeRow}>
                    <span className={`${styles.pill} ${user.role === 'admin' ? styles.admin : styles.agent}`}>
                      {user.role}
                    </span>
                    <span className={`${styles.pill} ${user.active ? styles.active : styles.inactive}`}>
                      {user.active ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>

                <p className={styles.authMethod}>
                  Auth: {hasGoogleAuth && hasPassword ? 'Google + Password' : hasGoogleAuth ? 'Google Only' : 'Password Only'}
                </p>

                <div className={styles.actionRow}>
                  <button type="button" onClick={() => openForm(user)} className={`${styles.actionButton} ${styles.editButton}`}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(user)}
                    className={`${styles.actionButton} ${styles.secondaryButton}`}
                  >
                    {user.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" onClick={() => handleDelete(user)} className={`${styles.actionButton} ${styles.dangerButton}`}>
                    Delete
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
