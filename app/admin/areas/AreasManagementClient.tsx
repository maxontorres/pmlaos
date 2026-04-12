'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'
import areaStyles from './areas.module.css'

interface Area {
  id: string
  nameEn: string
  nameLo: string
  nameZh: string
  slug: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AreasManagementClient() {
  const router = useRouter()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    nameEn: '',
    nameLo: '',
    nameZh: '',
    slug: '',
    active: true,
    order: 0,
  })

  useEffect(() => {
    fetchAreas()
  }, [])

  async function fetchAreas() {
    try {
      const res = await fetch('/api/areas')
      if (res.ok) {
        const data = await res.json()
        setAreas(data)
      }
    } catch (error) {
      console.error('Failed to fetch areas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!formData.nameEn || !formData.nameLo || !formData.nameZh) {
      alert('Please fill in all name fields')
      return
    }

    try {
      const res = await fetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ nameEn: '', nameLo: '', nameZh: '', slug: '', active: true, order: 0 })
        setShowAddForm(false)
        fetchAreas()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create area')
      }
    } catch (error) {
      console.error('Failed to create area:', error)
      alert('Failed to create area')
    }
  }

  async function handleUpdate(area: Area) {
    try {
      const res = await fetch(`/api/areas/${area.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: area.nameEn,
          nameLo: area.nameLo,
          nameZh: area.nameZh,
          slug: area.slug,
          active: area.active,
          order: area.order,
        }),
      })

      if (res.ok) {
        setEditingId(null)
        fetchAreas()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update area')
      }
    } catch (error) {
      console.error('Failed to update area:', error)
      alert('Failed to update area')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this area?')) return

    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchAreas()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete area')
      }
    } catch (error) {
      console.error('Failed to delete area:', error)
      alert('Failed to delete area')
    }
  }

  function handleEdit(area: Area) {
    setEditingId(area.id)
  }

  function handleCancelEdit() {
    setEditingId(null)
    fetchAreas()
  }

  function updateArea(id: string, field: string, value: any) {
    setAreas((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, [field]: value }
          if (field === 'nameEn') {
            updated.slug = generateSlug(value)
          }
          return updated
        }
        return a
      })
    )
  }

  if (loading) {
    return <div className={styles.stack}>Loading areas...</div>
  }

  return (
    <div className={styles.stack}>
      <div className={areaStyles.header}>
        <div className={areaStyles.headerContent}>
          <div>
            <h2 className={areaStyles.pageTitle}>Area Management</h2>
            <p className={areaStyles.pageSubtitle}>
              {areas.length} {areas.length === 1 ? 'area' : 'areas'} · {areas.filter(a => a.active).length} active
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={showAddForm ? areaStyles.btnSecondary : areaStyles.btnPrimary}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Area'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <section className={areaStyles.formCard}>
          <div className={areaStyles.formHeader}>
            <h3 className={areaStyles.formTitle}>Create New Area</h3>
            <p className={areaStyles.formSubtitle}>Add a new geographic area for property listings</p>
          </div>
          <div className={areaStyles.formGrid}>
            <div className={areaStyles.formGroup}>
              <label className={areaStyles.label}>
                English Name <span className={areaStyles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  nameEn: e.target.value,
                  slug: generateSlug(e.target.value)
                })}
                placeholder="e.g., Sikhottabong"
                className={areaStyles.input}
              />
            </div>
            <div className={areaStyles.formGroup}>
              <label className={areaStyles.label}>
                Lao Name <span className={areaStyles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.nameLo}
                onChange={(e) => setFormData({ ...formData, nameLo: e.target.value })}
                placeholder="e.g., ສີໂຄດຕະບອງ"
                className={areaStyles.input}
              />
            </div>
            <div className={areaStyles.formGroup}>
              <label className={areaStyles.label}>
                Chinese Name <span className={areaStyles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.nameZh}
                onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                placeholder="e.g., 西科塔蓬"
                className={areaStyles.input}
              />
            </div>
            <div className={areaStyles.formGroup}>
              <label className={areaStyles.label}>
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated from English name"
                className={areaStyles.input}
              />
              <p className={areaStyles.helpText}>Auto-updates based on English name (editable)</p>
            </div>
            <div className={areaStyles.formGroup}>
              <label className={areaStyles.label}>
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className={areaStyles.input}
                min="0"
              />
              <p className={areaStyles.helpText}>Lower numbers appear first</p>
            </div>
            <div className={areaStyles.formGroup}>
              <label className={areaStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className={areaStyles.checkbox}
                />
                <span>Active (visible to users)</span>
              </label>
            </div>
          </div>
          <div className={areaStyles.formActions}>
            <button onClick={handleCreate} className={areaStyles.btnPrimary}>
              ✓ Create Area
            </button>
            <button onClick={() => setShowAddForm(false)} className={areaStyles.btnSecondary}>
              Cancel
            </button>
          </div>
        </section>
      )}

      <section className={areaStyles.areaGrid}>
        {areas.length === 0 ? (
          <div className={areaStyles.emptyState}>
            <div className={areaStyles.emptyIcon}>🗺️</div>
            <h3 className={areaStyles.emptyTitle}>No areas yet</h3>
            <p className={areaStyles.emptyText}>Get started by creating your first geographic area</p>
          </div>
        ) : (
          areas.map((area) => {
            const isEditing = editingId === area.id

            return (
              <article key={area.id} className={areaStyles.areaCard}>
                {isEditing ? (
                  <div className={areaStyles.editForm}>
                    <div className={areaStyles.editHeader}>
                      <h3 className={areaStyles.editTitle}>Edit Area</h3>
                    </div>
                    <div className={areaStyles.formGrid}>
                      <div className={areaStyles.formGroup}>
                        <label className={areaStyles.label}>English Name</label>
                        <input
                          type="text"
                          value={area.nameEn}
                          onChange={(e) => updateArea(area.id, 'nameEn', e.target.value)}
                          className={areaStyles.input}
                        />
                      </div>
                      <div className={areaStyles.formGroup}>
                        <label className={areaStyles.label}>Lao Name</label>
                        <input
                          type="text"
                          value={area.nameLo}
                          onChange={(e) => updateArea(area.id, 'nameLo', e.target.value)}
                          className={areaStyles.input}
                        />
                      </div>
                      <div className={areaStyles.formGroup}>
                        <label className={areaStyles.label}>Chinese Name</label>
                        <input
                          type="text"
                          value={area.nameZh}
                          onChange={(e) => updateArea(area.id, 'nameZh', e.target.value)}
                          className={areaStyles.input}
                        />
                      </div>
                      <div className={areaStyles.formGroup}>
                        <label className={areaStyles.label}>Slug</label>
                        <input
                          type="text"
                          value={area.slug}
                          onChange={(e) => updateArea(area.id, 'slug', e.target.value)}
                          className={areaStyles.input}
                        />
                      </div>
                      <div className={areaStyles.formGroup}>
                        <label className={areaStyles.label}>Display Order</label>
                        <input
                          type="number"
                          value={area.order}
                          onChange={(e) => updateArea(area.id, 'order', parseInt(e.target.value) || 0)}
                          className={areaStyles.input}
                          min="0"
                        />
                      </div>
                      <div className={areaStyles.formGroup}>
                        <label className={areaStyles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={area.active}
                            onChange={(e) => updateArea(area.id, 'active', e.target.checked)}
                            className={areaStyles.checkbox}
                          />
                          <span>Active</span>
                        </label>
                      </div>
                    </div>
                    <div className={areaStyles.formActions}>
                      <button onClick={() => handleUpdate(area)} className={areaStyles.btnPrimary}>
                        ✓ Save Changes
                      </button>
                      <button onClick={handleCancelEdit} className={areaStyles.btnSecondary}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={areaStyles.cardHeader}>
                      <div className={areaStyles.cardTitleGroup}>
                        <h3 className={areaStyles.cardTitle}>{area.nameEn}</h3>
                        <span className={`${styles.pill} ${area.active ? styles.active : styles.inactive}`}>
                          {area.active ? '✓ Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className={areaStyles.cardBody}>
                      <div className={areaStyles.langRow}>
                        <span className={areaStyles.langLabel}>🇱🇦 Lao:</span>
                        <span className={areaStyles.langValue}>{area.nameLo}</span>
                      </div>
                      <div className={areaStyles.langRow}>
                        <span className={areaStyles.langLabel}>🇨🇳 Chinese:</span>
                        <span className={areaStyles.langValue}>{area.nameZh}</span>
                      </div>
                      <div className={areaStyles.metaRow}>
                        <div className={areaStyles.metaItem}>
                          <span className={areaStyles.metaLabel}>Slug:</span>
                          <code className={areaStyles.metaCode}>{area.slug}</code>
                        </div>
                        <div className={areaStyles.metaItem}>
                          <span className={areaStyles.metaLabel}>Order:</span>
                          <span className={areaStyles.metaValue}>{area.order}</span>
                        </div>
                      </div>
                    </div>
                    <div className={areaStyles.cardActions}>
                      <button onClick={() => handleEdit(area)} className={areaStyles.btnEdit}>
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(area.id)}
                        className={areaStyles.btnDelete}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}
