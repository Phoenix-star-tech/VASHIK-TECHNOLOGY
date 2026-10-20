'use client';

import React, { useState, useEffect } from 'react';
import {
  PortalAnnouncement,
  AnnouncementCategory,
  AnnouncementButton
} from './PortalState';
import {
  X,
  Plus,
  Trash2,
  Megaphone,
  Pin,
  ExternalLink,
  ArrowRight,
  Eye,
  Sparkles,
  Link2
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  editingAnnouncement: PortalAnnouncement | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    body: string;
    category: AnnouncementCategory;
    is_pinned: boolean;
    buttons: AnnouncementButton[];
  }) => void;
}

const CATEGORIES: AnnouncementCategory[] = [
  'Company Update',
  'Milestone',
  'Event',
  'Urgent',
  'General',
  'Policy'
];

export default function AdminAnnouncementModal({
  isOpen,
  editingAnnouncement,
  onClose,
  onSave
}: ModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('Company Update');
  const [isPinned, setIsPinned] = useState(false);
  const [buttons, setButtons] = useState<AnnouncementButton[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title || '');
      setBody(editingAnnouncement.body || '');
      setCategory(editingAnnouncement.category || 'Company Update');
      setIsPinned(Boolean(editingAnnouncement.is_pinned));
      setButtons(editingAnnouncement.buttons ? JSON.parse(JSON.stringify(editingAnnouncement.buttons)) : []);
    } else {
      setTitle('');
      setBody('');
      setCategory('Company Update');
      setIsPinned(false);
      setButtons([]);
    }
  }, [editingAnnouncement, isOpen]);

  if (!isOpen) return null;

  const handleAddButton = () => {
    const newBtn: AnnouncementButton = {
      id: `btn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: '',
      url: '',
      variant: 'primary'
    };
    setButtons([...buttons, newBtn]);
  };

  const handleRemoveButton = (id: string) => {
    setButtons(buttons.filter(b => b.id !== id));
  };

  const handleUpdateButton = (id: string, field: keyof AnnouncementButton, val: any) => {
    setButtons(buttons.map(b => b.id === id ? { ...b, [field]: val } : b));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Please provide both an announcement title and body text.');
      return;
    }

    // Filter out buttons with empty label or URL
    const cleanButtons = buttons
      .filter(b => b.label.trim() && b.url.trim())
      .map(b => ({
        ...b,
        label: b.label.trim(),
        url: b.url.trim()
      }));

    onSave({
      title: title.trim(),
      body: body.trim(),
      category,
      is_pinned: isPinned,
      buttons: cleanButtons
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Megaphone size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                {editingAnnouncement ? 'Edit Announcement' : 'Publish New Announcement'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                Notice will be displayed on the public announcements feed and employee portal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
              Announcement Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q4 2026 Engineering Sprint & Performance Rewards"
              style={{
                width: '100%',
                padding: '0.7rem 0.95rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '0.9rem',
                color: '#0f172a',
                outline: 'none',
                fontWeight: 600
              }}
            />
          </div>

          {/* Category & Pinned Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                Category Tag
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as AnnouncementCategory)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.95rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                userSelect: 'none'
              }}>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#d97706',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Pin size={14} color="#d97706" style={{ transform: 'rotate(45deg)' }} />
                  Pin this announcement at the top
                </span>
              </label>
            </div>
          </div>

          {/* Body Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b' }}>
                Announcement Content / Body <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Paragraphs and line breaks are preserved
              </span>
            </div>
            <textarea
              required
              rows={5}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write the full message, details, updates, milestone context, instructions, or meeting links..."
              style={{
                width: '100%',
                padding: '0.8rem 0.95rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '0.875rem',
                color: '#0f172a',
                outline: 'none',
                lineHeight: 1.6,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Dynamic Buttons Builder Section */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Link2 size={16} color="#2563eb" />
                  Action Buttons & Links (Optional)
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                  Add multiple clickable buttons linking to pages, forms, or external websites.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddButton}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9999px',
                  color: '#0f172a',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <Plus size={14} />
                <span>+ Add Button</span>
              </button>
            </div>

            {/* Buttons list */}
            {buttons.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '10px',
                color: '#94a3b8',
                fontSize: '0.78rem'
              }}>
                No action buttons added yet. Click &quot;+ Add Button&quot; to attach links (e.g., &quot;Open Portal&quot;, &quot;Read Docs&quot;).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {buttons.map((btn, idx) => (
                  <div
                    key={btn.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr)) 110px 36px',
                      gap: '0.65rem',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        placeholder="Button Text (e.g. Open Portal)"
                        value={btn.label}
                        onChange={e => handleUpdateButton(btn.id, 'label', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          color: '#0f172a'
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="URL (e.g. /portal or https://...)"
                        value={btn.url}
                        onChange={e => handleUpdateButton(btn.id, 'url', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          color: '#0f172a'
                        }}
                      />
                    </div>

                    <div>
                      <select
                        value={btn.variant || 'primary'}
                        onChange={e => handleUpdateButton(btn.id, 'variant', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.5rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          color: '#0f172a',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <option value="primary">Solid Dark</option>
                        <option value="outline">Outline Blue</option>
                        <option value="secondary">Light Gray</option>
                      </select>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveButton(btn.id)}
                        title="Remove button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.35rem',
                          borderRadius: '6px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Preview Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Eye size={14} />
              <span>{showPreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
            </button>

            {showPreview && (
              <div style={{
                marginTop: '0.75rem',
                backgroundColor: '#ffffff',
                border: isPinned ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  PREVIEW CARD
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    {category}
                  </span>
                  {isPinned && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                      Pinned
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  {title || '(Announcement Title Preview)'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', margin: '0 0 1rem 0' }}>
                  {body || '(Announcement content will appear here...)'}
                </p>
                {buttons.filter(b => b.label.trim()).length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    {buttons.filter(b => b.label.trim()).map((b, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: b.variant === 'secondary' ? '#f1f5f9' : b.variant === 'outline' ? '#ffffff' : '#0f172a',
                          color: b.variant === 'outline' ? '#2563eb' : b.variant === 'secondary' ? '#0f172a' : '#ffffff',
                          border: b.variant === 'outline' ? '1.5px solid #2563eb' : '1px solid transparent'
                        }}
                      >
                        {b.label} &rarr;
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0',
            marginTop: '0.5rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '9999px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '0.65rem 1.65rem',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
              }}
            >
              <Megaphone size={15} />
              <span>{editingAnnouncement ? 'Save Announcement Changes' : 'Publish Announcement Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
