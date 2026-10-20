'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PortalAnnouncement,
  AnnouncementCategory
} from './PortalState';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  Pin,
  ExternalLink,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle,
  Link2
} from 'lucide-react';

interface TabProps {
  announcements: PortalAnnouncement[];
  onOpenCreate: () => void;
  onOpenEdit: (announcement: PortalAnnouncement) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number, currentPinned: boolean) => void;
}

const CATEGORIES: { label: string; value: 'all' | AnnouncementCategory }[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Company Update', value: 'Company Update' },
  { label: 'Milestone', value: 'Milestone' },
  { label: 'Event', value: 'Event' },
  { label: 'Urgent', value: 'Urgent' },
  { label: 'General', value: 'General' },
  { label: 'Policy', value: 'Policy' }
];

export default function AdminAnnouncementsTab({
  announcements,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onTogglePin
}: TabProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AnnouncementCategory>('all');

  const filtered = announcements.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const pinnedCount = announcements.filter(a => a.is_pinned).length;

  return (
    <div>
      {/* Tab Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>
            Announcements & Dispatch Suite
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
            Broadcast news, releases, milestone alerts, and deliverables. Live on <Link href="/announcements" target="_blank" style={{ color: '#2563eb', fontWeight: 600 }}>vashik.in/announcements</Link> and employee portals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link
            href="/announcements"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <Eye size={14} color="#64748b" />
            <span>View Public Page</span>
            <ExternalLink size={12} color="#94a3b8" />
          </Link>

          <button
            onClick={onOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '9999px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
            }}
          >
            <Plus size={15} />
            <span>+ Publish New Announcement</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.15rem 1.25rem'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Dispatches
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
            {announcements.length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.15rem 1.25rem'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Pinned Notices
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>
            {pinnedCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.15rem 1.25rem'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Action Links Active
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#2563eb', marginTop: '0.2rem' }}>
            {announcements.reduce((acc, a) => acc + (a.buttons?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#0f172a',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as any)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#0f172a',
              cursor: 'pointer'
            }}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(ann => {
          const dateStr = new Date(ann.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div
              key={ann.id}
              style={{
                backgroundColor: '#ffffff',
                border: ann.is_pinned ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              {/* Header row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8'
                  }}>
                    {ann.category}
                  </span>

                  {ann.is_pinned && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      color: '#b45309'
                    }}>
                      <Pin size={11} style={{ transform: 'rotate(45deg)' }} />
                      Pinned Notice
                    </span>
                  )}

                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {dateStr}
                  </span>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={() => onTogglePin(ann.id, Boolean(ann.is_pinned))}
                    title={ann.is_pinned ? 'Unpin announcement' : 'Pin to top'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      border: `1px solid ${ann.is_pinned ? '#fde68a' : '#e2e8f0'}`,
                      backgroundColor: ann.is_pinned ? '#fffbeb' : '#ffffff',
                      color: ann.is_pinned ? '#b45309' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Pin size={12} style={{ transform: 'rotate(45deg)' }} />
                    <span>{ann.is_pinned ? 'Pinned' : 'Pin'}</span>
                  </button>

                  <button
                    onClick={() => onOpenEdit(ann)}
                    title="Edit announcement"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onDelete(ann.id)}
                    title="Delete announcement"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '8px',
                      border: '1px solid #fee2e2',
                      backgroundColor: '#ffffff',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                {ann.title}
              </h4>
              <p style={{
                fontSize: '0.85rem',
                color: '#475569',
                lineHeight: 1.6,
                margin: '0 0 0.85rem 0',
                whiteSpace: 'pre-line'
              }}>
                {ann.body}
              </p>

              {/* Action Buttons Attached */}
              {ann.buttons && ann.buttons.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginRight: '0.25rem' }}>
                    Buttons ({ann.buttons.length}):
                  </span>
                  {ann.buttons.map(btn => (
                    <a
                      key={btn.id}
                      href={btn.url}
                      target={btn.url.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        backgroundColor: btn.variant === 'secondary' ? '#f1f5f9' : btn.variant === 'outline' ? '#ffffff' : '#0f172a',
                        color: btn.variant === 'outline' ? '#2563eb' : btn.variant === 'secondary' ? '#0f172a' : '#ffffff',
                        border: btn.variant === 'outline' ? '1px solid #2563eb' : '1px solid transparent'
                      }}
                    >
                      <span>{btn.label}</span>
                      <ArrowRight size={11} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0'
          }}>
            <Megaphone size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              No announcements match your search
            </div>
            <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '0 0 1rem 0' }}>
              Try searching with different terms or publish a new announcement.
            </p>
            <button
              onClick={onOpenCreate}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Create Announcement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
