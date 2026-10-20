'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PortalAnnouncement,
  AnnouncementCategory,
  AnnouncementButton,
  PortalStorage
} from './PortalState';
import {
  Megaphone,
  Pin,
  Calendar,
  ExternalLink,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  Bell,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';

const CATEGORIES: { label: string; value: 'all' | AnnouncementCategory }[] = [
  { label: 'All Notices', value: 'all' },
  { label: 'Company Update', value: 'Company Update' },
  { label: 'Milestone', value: 'Milestone' },
  { label: 'Event', value: 'Event' },
  { label: 'Urgent', value: 'Urgent' },
  { label: 'General', value: 'General' },
  { label: 'Policy', value: 'Policy' }
];

export default function AnnouncementsView() {
  const [mounted, setMounted] = useState(false);
  const [announcements, setAnnouncements] = useState<PortalAnnouncement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | AnnouncementCategory>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const data = PortalStorage.getAnnouncements();
    setAnnouncements(data);

    // Optional background sync if Supabase is active
    PortalStorage.syncFromSupabase().then(() => {
      setAnnouncements(PortalStorage.getAnnouncements());
    });
  }, []);

  const handleCopyLink = (announcement: PortalAnnouncement) => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/announcements#announcement-${announcement.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedId(announcement.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const getCategoryColor = (cat: AnnouncementCategory) => {
    switch (cat) {
      case 'Company Update':
        return { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', dot: '#3b82f6' };
      case 'Milestone':
        return { bg: '#fef3c7', border: '#fde68a', text: '#b45309', dot: '#f59e0b' };
      case 'Event':
        return { bg: '#f3e8ff', border: '#e9d5ff', text: '#7e22ce', dot: '#a855f7' };
      case 'Urgent':
        return { bg: '#fee2e2', border: '#fecaca', text: '#b91c1c', dot: '#ef4444' };
      case 'Policy':
        return { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', dot: '#10b981' };
      default:
        return { bg: '#f1f5f9', border: '#e2e8f0', text: '#334155', dot: '#64748b' };
    }
  };

  const filteredAnnouncements = announcements.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned);

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', borderTopColor: '#0f172a', animation: 'spin 0.8s linear infinite' }} />
          Loading Official Announcements...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      paddingBottom: '4rem'
    }}>
      {/* Header Bar */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* Logo & Brand */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <Image
              src="/logo.png"
              alt="Vashik Technologies"
              width={34}
              height={34}
              style={{ objectFit: 'contain' }}
              priority
            />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                VASHIK <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>TECHNOLOGIES</span>
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#2563eb', textTransform: 'uppercase' }}>
                Corporate Communications Feed
              </div>
            </div>
          </Link>

          {/* Quick Actions / Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s'
              }}
            >
              <ArrowLeft size={13} />
              <span>Main Website</span>
            </Link>

            <Link
              href="/portal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(15,23,42,0.12)',
                transition: 'all 0.15s'
              }}
            >
              <span>Employee Workspace</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '2.5rem 1.25rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            margin: '0',
            lineHeight: 1.15
          }}>
            Announcements
          </h1>

          {/* Search & Category Filter Controls */}
          <div style={{
            marginTop: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Search Input Bar */}
            <div style={{ position: 'relative', maxWidth: '540px' }}>
              <Search
                size={16}
                color="#64748b"
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search announcements by title, keyword, or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.15s, background-color 0.15s'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '0.2rem 0.4rem'
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              WebkitOverflowScrolling: 'touch'
            }}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    style={{
                      padding: '0.4rem 0.95rem',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? '#0f172a' : '#e2e8f0'}`,
                      backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      boxShadow: isSelected ? '0 2px 6px rgba(15,23,42,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto 0', padding: '0 1.25rem' }}>
        {/* Results summary bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Showing <strong style={{ color: '#0f172a' }}>{filteredAnnouncements.length}</strong> {filteredAnnouncements.length === 1 ? 'announcement' : 'announcements'}
            {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>

        {/* Empty state */}
        {filteredAnnouncements.length === 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <Megaphone size={40} color="#94a3b8" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              No announcements found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              No announcements match your search filters. Try adjusting your query or resetting the category filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              style={{
                padding: '0.55rem 1.25rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* PINNED ANNOUNCEMENTS SECTION */}
        {pinnedAnnouncements.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '1rem'
            }}>
              <Pin size={16} color="#d97706" style={{ transform: 'rotate(45deg)' }} />
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#d97706'
              }}>
                Pinned & Urgent Notices
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {pinnedAnnouncements.map(announcement => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  isPinnedSection={true}
                  onCopyLink={handleCopyLink}
                  copied={copiedId === announcement.id}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* REGULAR ANNOUNCEMENTS SECTION */}
        {regularAnnouncements.length > 0 && (
          <div>
            {pinnedAnnouncements.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                marginBottom: '1rem'
              }}>
                <Calendar size={16} color="#64748b" />
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#64748b'
                }}>
                  Recent Dispatches
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {regularAnnouncements.map(announcement => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  isPinnedSection={false}
                  onCopyLink={handleCopyLink}
                  copied={copiedId === announcement.id}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Single Announcement Card Component
// ----------------------------------------------------------------------------
interface CardProps {
  announcement: PortalAnnouncement;
  isPinnedSection: boolean;
  onCopyLink: (announcement: PortalAnnouncement) => void;
  copied: boolean;
  getCategoryColor: (cat: AnnouncementCategory) => { bg: string; border: string; text: string; dot: string };
}

function AnnouncementCard({ announcement, isPinnedSection, onCopyLink, copied, getCategoryColor }: CardProps) {
  const catColor = getCategoryColor(announcement.category);
  const formattedDate = new Date(announcement.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article
      id={`announcement-${announcement.id}`}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: announcement.is_pinned ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
        boxShadow: announcement.is_pinned ? '0 4px 20px rgba(245, 158, 11, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {/* Top Banner accent stripe if pinned */}
      {announcement.is_pinned && (
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
        }} />
      )}

      <div style={{ padding: '1.5rem 1.75rem' }}>
        {/* Card Header Meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Category Badge */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: catColor.bg,
              border: `1px solid ${catColor.border}`,
              color: catColor.text,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: catColor.dot }} />
              {announcement.category}
            </span>

            {/* Pinned pill */}
            {announcement.is_pinned && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                <Pin size={11} style={{ transform: 'rotate(45deg)' }} />
                Featured Notice
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} color="#94a3b8" />
              {formattedDate}
            </span>

            {/* Copy permalink button */}
            <button
              onClick={() => onCopyLink(announcement)}
              title="Copy link to announcement"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.55rem',
                backgroundColor: copied ? '#ecfdf5' : '#f8fafc',
                border: `1px solid ${copied ? '#a7f3d0' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '0.72rem',
                color: copied ? '#065f46' : '#64748b',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={12} color="#059669" /> : <Share2 size={12} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 'clamp(1.2rem, 2.2vw, 1.45rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#0f172a',
          margin: '0 0 0.85rem 0',
          lineHeight: 1.3
        }}>
          {announcement.title}
        </h2>

        {/* Body Text */}
        <div style={{
          fontSize: '0.925rem',
          lineHeight: 1.7,
          color: '#334155',
          whiteSpace: 'pre-line',
          marginBottom: announcement.buttons && announcement.buttons.length > 0 ? '1.5rem' : 0
        }}>
          {announcement.body}
        </div>

        {/* Optional Action Buttons Row */}
        {announcement.buttons && announcement.buttons.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.65rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            {announcement.buttons.map(btn => (
              <AnnouncementActionButton key={btn.id} button={btn} />
            ))}
          </div>
        )}

        {/* Author Footer */}
        <div style={{
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}>
          <span>Posted by:</span>
          <strong style={{ color: '#64748b', fontWeight: 600 }}>{announcement.created_by_name || 'Vashik Admin'}</strong>
        </div>
      </div>
    </article>
  );
}

// ----------------------------------------------------------------------------
// Action Button Render Helper
// ----------------------------------------------------------------------------
function AnnouncementActionButton({ button }: { button: AnnouncementButton }) {
  const isExternal = button.url.startsWith('http://') || button.url.startsWith('https://');
  const variant = button.variant || 'primary';

  let styleObj: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.6rem 1.15rem',
    borderRadius: '10px',
    fontSize: '0.825rem',
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  };

  if (variant === 'primary') {
    styleObj = {
      ...styleObj,
      backgroundColor: '#0f172a',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 6px rgba(15,23,42,0.15)'
    };
  } else if (variant === 'secondary') {
    styleObj = {
      ...styleObj,
      backgroundColor: '#f1f5f9',
      color: '#0f172a',
      border: '1px solid #cbd5e1'
    };
  } else {
    // outline
    styleObj = {
      ...styleObj,
      backgroundColor: '#ffffff',
      color: '#2563eb',
      border: '1.5px solid #2563eb'
    };
  }

  const content = (
    <>
      <span>{button.label}</span>
      {isExternal ? <ExternalLink size={13} /> : <ArrowRight size={13} />}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={button.url}
        target="_blank"
        rel="noopener noreferrer"
        style={styleObj}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={button.url} style={styleObj}>
      {content}
    </Link>
  );
}
