'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'
import villageStyles from './villages.module.css'

interface Village {
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

export default function VillagesManagementClient() {
  const router = useRouter()
  const [villages, setVillages] = useState<Village[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nameEn: '',
    nameLo: '',
    nameZh: '',
    slug: '',
    active: true,
    order: 0,
  })

  useEffect(() => {
    fetchVillages()
  }, [])

  async function fetchVillages() {
    try {
      const res = await fetch('/api/villages')
      if (res.ok) {
        const data = await res.json()
        setVillages(data)
      }
    } catch (error) {
      console.error('Failed to fetch villages:', error)
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
      const res = await fetch('/api/villages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ nameEn: '', nameLo: '', nameZh: '', slug: '', active: true, order: 0 })
        setShowAddForm(false)
        fetchVillages()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create village')
      }
    } catch (error) {
      console.error('Failed to create village:', error)
      alert('Failed to create village')
    }
  }

  async function handleUpdate(village: Village) {
    try {
      const res = await fetch(`/api/villages/${village.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: village.nameEn,
          nameLo: village.nameLo,
          nameZh: village.nameZh,
          slug: village.slug,
          active: village.active,
          order: village.order,
        }),
      })

      if (res.ok) {
        setEditingId(null)
        fetchVillages()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update village')
      }
    } catch (error) {
      console.error('Failed to update village:', error)
      alert('Failed to update village')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this village?')) return

    try {
      const res = await fetch(`/api/villages/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchVillages()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete village')
      }
    } catch (error) {
      console.error('Failed to delete village:', error)
      alert('Failed to delete village')
    }
  }

  function handleEdit(village: Village) {
    setEditingId(village.id)
  }

  function handleCancelEdit() {
    setEditingId(null)
    fetchVillages()
  }

  function updateVillage(id: string, field: string, value: unknown) {
    setVillages((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, [field]: value }
          if (field === 'nameEn') {
            updated.slug = generateSlug(value as string)
          }
          return updated
        }
        return v
      })
    )
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  async function handleDrop(dropIndex: number) {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const reorderedVillages = [...villages]
    const [draggedItem] = reorderedVillages.splice(draggedIndex, 1)
    reorderedVillages.splice(dropIndex, 0, draggedItem)

    const updatedVillages = reorderedVillages.map((village, index) => ({
      ...village,
      order: index,
    }))

    setVillages(updatedVillages)
    setDraggedIndex(null)

    try {
      await Promise.all(
        updatedVillages.map((village) =>
          fetch(`/api/villages/${village.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: village.order }),
          })
        )
      )
    } catch (error) {
      console.error('Failed to update village order:', error)
      alert('Failed to update village order')
      fetchVillages()
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null)
  }

  async function moveVillage(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === villages.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const reorderedVillages = [...villages]
    const [movedItem] = reorderedVillages.splice(index, 1)
    reorderedVillages.splice(newIndex, 0, movedItem)

    const updatedVillages = reorderedVillages.map((village, idx) => ({
      ...village,
      order: idx,
    }))

    setVillages(updatedVillages)

    try {
      await Promise.all(
        updatedVillages.map((village) =>
          fetch(`/api/villages/${village.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: village.order }),
          })
        )
      )
    } catch (error) {
      console.error('Failed to update village order:', error)
      alert('Failed to update village order')
      fetchVillages()
    }
  }

  if (loading) {
    return <div className={styles.stack}>Loading villages...</div>
  }

  return (
    <div className={styles.stack}>
      <div className={villageStyles.header}>
        <div className={villageStyles.headerContent}>
          <div>
            <h2 className={villageStyles.pageTitle}>Village Management</h2>
            <p className={villageStyles.pageSubtitle}>
              {villages.length} {villages.length === 1 ? 'village' : 'villages'} · {villages.filter(v => v.active).length} active
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={showAddForm ? villageStyles.btnSecondary : villageStyles.btnPrimary}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Village'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <section className={villageStyles.formCard}>
          <div className={villageStyles.formHeader}>
            <h3 className={villageStyles.formTitle}>Create New Village</h3>
            <p className={villageStyles.formSubtitle}>Add a new village for property listings</p>
          </div>
          <div className={villageStyles.formGrid}>
            <div className={villageStyles.formGroup}>
              <label className={villageStyles.label}>
                English Name <span className={villageStyles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({
                  ...formData,
                  nameEn: e.target.value,
                  slug: generateSlug(e.target.value)
                })}
                placeholder="e.g., Ban Phonthan"
                className={villageStyles.input}
              />
            </div>
            <div className={villageStyles.formGroup}>
              <label className={villageStyles.label}>
                Lao Name <span className={villageStyles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.nameLo}
                onChange={(e) => setFormData({ ...formData, nameLo: e.target.value })}
                placeholder="e.g., ບ້ານໂພນທ່ານ"
                className={villageStyles.input}
              />
            </div>
            <div className={villageStyles.formGroup}>
              <label className={villageStyles.label}>
                Chinese Name <span className={villageStyles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.nameZh}
                onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                placeholder="e.g., 丰塔南村"
                className={villageStyles.input}
              />
            </div>
            <div className={villageStyles.formGroup}>
              <label className={villageStyles.label}>
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated from English name"
                className={villageStyles.input}
              />
              <p className={villageStyles.helpText}>Auto-updates based on English name (editable)</p>
            </div>
            <div className={villageStyles.formGroup}>
              <label className={villageStyles.label}>
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className={villageStyles.input}
                min="0"
              />
              <p className={villageStyles.helpText}>Lower numbers appear first</p>
            </div>
            <div className={villageStyles.formGroup}>
              <label className={villageStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className={villageStyles.checkbox}
                />
                <span>Active (visible to users)</span>
              </label>
            </div>
          </div>
          <div className={villageStyles.formActions}>
            <button onClick={handleCreate} className={villageStyles.btnPrimary}>
              ✓ Create Village
            </button>
            <button onClick={() => setShowAddForm(false)} className={villageStyles.btnSecondary}>
              Cancel
            </button>
          </div>
        </section>
      )}

      <section className={villageStyles.areaGrid}>
        {villages.length === 0 ? (
          <div className={villageStyles.emptyState}>
            <div className={villageStyles.emptyIcon}>🗺️</div>
            <h3 className={villageStyles.emptyTitle}>No villages yet</h3>
            <p className={villageStyles.emptyText}>Get started by creating your first village</p>
          </div>
        ) : (
          villages.map((village, index) => {
            const isEditing = editingId === village.id
            const isDragging = draggedIndex === index

            return (
              <article 
                key={village.id} 
                className={`${villageStyles.areaCard} ${isDragging ? villageStyles.dragging : ''}`}
                draggable={!isEditing}
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
              >
                {isEditing ? (
                  <div className={villageStyles.editForm}>
                    <div className={villageStyles.editHeader}>
                      <h3 className={villageStyles.editTitle}>Edit Village</h3>
                    </div>
                    <div className={villageStyles.formGrid}>
                      <div className={villageStyles.formGroup}>
                        <label className={villageStyles.label}>English Name</label>
                        <input
                          type="text"
                          value={village.nameEn}
                          onChange={(e) => updateVillage(village.id, 'nameEn', e.target.value)}
                          className={villageStyles.input}
                        />
                      </div>
                      <div className={villageStyles.formGroup}>
                        <label className={villageStyles.label}>Lao Name</label>
                        <input
                          type="text"
                          value={village.nameLo}
                          onChange={(e) => updateVillage(village.id, 'nameLo', e.target.value)}
                          className={villageStyles.input}
                        />
                      </div>
                      <div className={villageStyles.formGroup}>
                        <label className={villageStyles.label}>Chinese Name</label>
                        <input
                          type="text"
                          value={village.nameZh}
                          onChange={(e) => updateVillage(village.id, 'nameZh', e.target.value)}
                          className={villageStyles.input}
                        />
                      </div>
                      <div className={villageStyles.formGroup}>
                        <label className={villageStyles.label}>Slug</label>
                        <input
                          type="text"
                          value={village.slug}
                          onChange={(e) => updateVillage(village.id, 'slug', e.target.value)}
                          className={villageStyles.input}
                        />
                      </div>
                      <div className={villageStyles.formGroup}>
                        <label className={villageStyles.label}>Display Order</label>
                        <input
                          type="number"
                          value={village.order}
                          onChange={(e) => updateVillage(village.id, 'order', parseInt(e.target.value) || 0)}
                          className={villageStyles.input}
                          min="0"
                        />
                      </div>
                      <div className={villageStyles.formGroup}>
                        <label className={villageStyles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={village.active}
                            onChange={(e) => updateVillage(village.id, 'active', e.target.checked)}
                            className={villageStyles.checkbox}
                          />
                          <span>Active</span>
                        </label>
                      </div>
                    </div>
                    <div className={villageStyles.formActions}>
                      <button onClick={() => handleUpdate(village)} className={villageStyles.btnPrimary}>
                        ✓ Save Changes
                      </button>
                      <button onClick={handleCancelEdit} className={villageStyles.btnSecondary}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={villageStyles.cardHeader}>
                      <div className={villageStyles.cardHeaderLeft}>
                        <div className={villageStyles.dragHandle} title="Drag to reorder">⋮⋮</div>
                        <div className={villageStyles.cardTitleGroup}>
                          <h3 className={villageStyles.cardTitle}>{village.nameEn}</h3>
                          <span className={`${styles.pill} ${village.active ? styles.active : styles.inactive}`}>
                            {village.active ? '✓ Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className={villageStyles.arrowButtons}>
                        <button
                          onClick={() => moveVillage(index, 'up')}
                          disabled={index === 0}
                          className={villageStyles.arrowBtn}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveVillage(index, 'down')}
                          disabled={index === villages.length - 1}
                          className={villageStyles.arrowBtn}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    <div className={villageStyles.cardBody}>
                      <div className={villageStyles.langRow}>
                        <span className={villageStyles.langLabel}>🇱🇦 Lao:</span>
                        <span className={villageStyles.langValue}>{village.nameLo}</span>
                      </div>
                      <div className={villageStyles.langRow}>
                        <span className={villageStyles.langLabel}>🇨🇳 Chinese:</span>
                        <span className={villageStyles.langValue}>{village.nameZh}</span>
                      </div>
                      <div className={villageStyles.metaRow}>
                        <div className={villageStyles.metaItem}>
                          <span className={villageStyles.metaLabel}>Slug:</span>
                          <code className={villageStyles.metaCode}>{village.slug}</code>
                        </div>
                        <div className={villageStyles.metaItem}>
                          <span className={villageStyles.metaLabel}>Order:</span>
                          <span className={villageStyles.metaValue}>{village.order}</span>
                        </div>
                      </div>
                    </div>
                    <div className={villageStyles.cardActions}>
                      <button onClick={() => handleEdit(village)} className={villageStyles.btnEdit}>
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(village.id)}
                        className={villageStyles.btnDelete}
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
