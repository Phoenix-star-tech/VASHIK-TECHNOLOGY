'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PortalUser,
  PortalTask,
  TaskPriority,
  TaskStatus,
  PointsHistoryEntry,
  NotificationItem,
  PortalStorage,
  PortalAnnouncement
} from './PortalState';
import { isSupabaseConfigured, getSupabaseConfig, getSupabaseClient } from '@/lib/supabase';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Trophy,
  ArrowRight,
  LogOut,
  Bell,
  ExternalLink,
  MessageSquare,
  Send,
  Award,
  ChevronRight,
  ArrowLeft,
  X,
  Database,
  Calendar,
  Lock,
  FileText,
  Eye,
  EyeOff,
  Search,
  Info,
  UserCheck,
  Megaphone,
  Pin
} from 'lucide-react';

export default function EmployeePortalView() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<PortalUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'announcements' | 'leaderboard' | 'profile'>('dashboard');

  // Announcements Data
  const [announcements, setAnnouncements] = useState<PortalAnnouncement[]>([]);
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState<string>('all');

  // Login form state (Only for employees!)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forced password change state
  const [forceNewPass, setForceNewPass] = useState('');
  const [forceConfirmPass, setForceConfirmPass] = useState('');
  const [showForceNewPass, setShowForceNewPass] = useState(false);
  const [showForceConfirmPass, setShowForceConfirmPass] = useState(false);
  const [forcePassError, setForcePassError] = useState<string | null>(null);

  // Data collections
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [tasks, setTasks] = useState<PortalTask[]>([]);
  const [history, setHistory] = useState<PointsHistoryEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Filters & Search
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'Pending' | 'Completed' | 'Overdue'>('all');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  // Task Detail Modal
  const [selectedTask, setSelectedTask] = useState<PortalTask | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [newComment, setNewComment] = useState('');
  const [taskFeedbackMsg, setTaskFeedbackMsg] = useState<string | null>(null);

  // Supabase status
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const session = PortalStorage.getEmployeeSession();
    if (session && session.role === 'employee') {
      setCurrentUser(session);
    }
    refreshAllData();

    const isConfigured = isSupabaseConfigured();
    setSupabaseConnected(isConfigured);

    if (isConfigured) {
      PortalStorage.syncFromSupabase().then(success => {
        if (success) refreshAllData();
      });
    }

    // Subscribe to Realtime announcements & cross-tab sync
    const unsubAnnouncements = PortalStorage.subscribeToAnnouncements(items => {
      setAnnouncements(items);
    });

    // Auto 1-minute overdue scheduler
    PortalStorage.checkAndProcessOverdue();
    refreshAllData();

    const interval = setInterval(() => {
      const changed = PortalStorage.checkAndProcessOverdue();
      if (changed) refreshAllData();
    }, 60000);

    return () => {
      clearInterval(interval);
      unsubAnnouncements();
    };
  }, []);

  const refreshAllData = () => {
    setUsers(PortalStorage.getUsers());
    setTasks(PortalStorage.getTasks());
    setHistory(PortalStorage.getHistory());
    setNotifications(PortalStorage.getNotifications());
    setAnnouncements(PortalStorage.getAnnouncements());
    const sess = PortalStorage.getEmployeeSession();
    if (sess && sess.role === 'employee') {
      const allUsers = PortalStorage.getUsers();
      const updated = allUsers.find(
        u => sess.id && Number(u.id) === Number(sess.id)
      );
      if (updated) {
        setCurrentUser(updated);
        PortalStorage.setEmployeeSession(updated);
      } else {
        setCurrentUser(sess);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const entered = loginUsername.trim().toLowerCase();
    const enteredPass = loginPassword.trim();

    let userPool = users;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: dbUsers, error } = await supabase.from('users').select('*');
        if (!error && dbUsers && dbUsers.length > 0) {
          userPool = dbUsers;
          PortalStorage.setUsers(dbUsers);
          setUsers(dbUsers);
        }
      } catch (err) {
        console.warn('Supabase live check fallback to cache:', err);
      }
    }

    const adminAccount = userPool.find(
      u => (u.username.toLowerCase() === entered || u.email.toLowerCase() === entered) &&
           u.role === 'admin'
    );

    if (adminAccount) {
      setLoginError('This portal is exclusively for employees.');
      return;
    }

    const found = userPool.find(
      u => (u.username.toLowerCase() === entered || u.email.toLowerCase() === entered) &&
           u.role === 'employee'
    );

    if (!found) {
      setLoginError('Invalid employee credentials. Please check your username and password.');
      return;
    }

    if (!found.is_active) {
      setLoginError('Your account has been deactivated. Please contact your manager.');
      return;
    }

    // Check plain password or password hash
    const passMatches =
      found.password_plain === enteredPass ||
      (found as any).password_hash === enteredPass;

    if (!passMatches) {
      setLoginError('Incorrect password. Please verify your credentials.');
      return;
    }

    PortalStorage.setEmployeeSession(found);
    PortalStorage.setSessionUser(found);
    setCurrentUser(found);
    PortalStorage.logAudit('EMPLOYEE_LOGIN', `Employee @${found.username} logged in.`);
  };

  const handleLogout = () => {
    PortalStorage.setEmployeeSession(null);
    PortalStorage.setSessionUser(null);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleForcedPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForcePassError(null);

    if (forceNewPass.length < 8) {
      setForcePassError('Password must contain at least 8 characters.');
      return;
    }

    if (forceNewPass !== forceConfirmPass) {
      setForcePassError('Passwords do not match.');
      return;
    }

    if (!currentUser) return;

    const allUsers = PortalStorage.getUsers();
    const updated = allUsers.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          password_plain: forceNewPass,
          must_change_password: false
        };
      }
      return u;
    });

    PortalStorage.setUsers(updated);
    const updatedSession = updated.find(u => u.id === currentUser.id)!;
    PortalStorage.setSessionUser(updatedSession);
    setCurrentUser(updatedSession);
    PortalStorage.logAudit('FORCED_PASSWORD_CHANGED', `First-login password updated for employee @${currentUser.username}`);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('users').update({
        password_plain: forceNewPass,
        password_hash: forceNewPass,
        must_change_password: false
      }).eq('id', currentUser.id).then();
    }

    refreshAllData();
  };

  const handleMarkTaskComplete = (taskId: number) => {
    const allTasks = PortalStorage.getTasks();
    const target = allTasks.find(t => t.id === taskId);
    if (!target || target.status === 'Completed') return;

    const now = Date.now();
    const isBeforeDeadline = now <= new Date(target.deadline).getTime();
    let bonusAwarded = false;

    if (isBeforeDeadline && !target.points_bonus_awarded && !target.points_deducted) {
      const allUsers = PortalStorage.getUsers();
      const emp = allUsers.find(u => u.id === target.assigned_to);
      if (emp) {
        emp.points += 5;
        bonusAwarded = true;
        PortalStorage.setUsers(allUsers);

        const allHist = PortalStorage.getHistory();
        allHist.unshift({
          id: Date.now(),
          user_id: emp.id,
          task_id: target.id,
          task_title: target.title,
          change: 5,
          balance_after: emp.points,
          reason: `On-time completion bonus for task "${target.title}"`,
          created_at: new Date().toISOString()
        });
        PortalStorage.setHistory(allHist);
      }
    }

    target.status = 'Completed';
    target.completed_at = new Date().toISOString();
    target.completion_note = completionNote.trim() || 'Deliverables finalized and submitted.';
    target.points_bonus_awarded = bonusAwarded;

    PortalStorage.setTasks(allTasks);
    PortalStorage.logAudit('TASK_COMPLETED', `Task #${target.id} completed by @${currentUser?.username}. Bonus: ${bonusAwarded ? '+5 pts' : 'None'}`);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('tasks').update({
        status: 'Completed',
        completed_at: target.completed_at,
        completion_note: target.completion_note,
        points_bonus_awarded: bonusAwarded
      }).eq('id', target.id).then();

      if (bonusAwarded && currentUser) {
        supabase.from('users').update({ points: currentUser.points + 5 }).eq('id', currentUser.id).then();
        supabase.from('points_history').insert([{
          user_id: currentUser.id,
          task_id: target.id,
          task_title: target.title,
          change: 5,
          balance_after: currentUser.points + 5,
          reason: `On-time completion bonus for task "${target.title}"`
        }]).then();
      }
    }

    setTaskFeedbackMsg(
      bonusAwarded
        ? '✓ Task completed before deadline! +5 bonus points awarded.'
        : '✓ Task marked as completed.'
    );

    refreshAllData();
    setSelectedTask({ ...target });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim() || !currentUser) return;

    const allTasks = PortalStorage.getTasks();
    const taskObj = allTasks.find(t => t.id === selectedTask.id);
    if (!taskObj) return;

    const commentObj = {
      id: Date.now(),
      task_id: taskObj.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      message: newComment.trim(),
      created_at: new Date().toISOString()
    };

    taskObj.comments.push(commentObj);
    PortalStorage.setTasks(allTasks);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('comments').insert([{
        task_id: taskObj.id,
        user_id: currentUser.id,
        message: newComment.trim()
      }]).then();
    }

    setNewComment('');
    setSelectedTask({ ...taskObj });
    refreshAllData();
  };

  const getCountdownString = (deadline: string, status: TaskStatus) => {
    if (status === 'Completed') return '✓ Completed';
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      const hours = Math.floor(absDiff / 3600000);
      const mins = Math.floor((absDiff % 3600000) / 60000);
      return `⚠️ Overdue by ${hours}h ${mins}m`;
    }
    const days = Math.floor(diff / (86400000));
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m remaining`;
  };

  // Full formatted date and time for deliverables
  const formatFullDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Human relative time helper
  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const isPast = diffMs >= 0;
      const absDiff = Math.abs(diffMs);
      const mins = Math.floor(absDiff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ${isPast ? 'ago' : 'from now'}`;
      if (hours > 0) return `${hours}h ${isPast ? 'ago' : 'from now'}`;
      if (mins > 0) return `${mins}m ${isPast ? 'ago' : 'from now'}`;
      return 'just now';
    } catch {
      return '';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const employeeUsers = users.filter(u => u.role === 'employee');
  const myTasks = currentUser ? tasks.filter(t => 
    Number(t.assigned_to) === Number(currentUser.id)
  ) : [];

  const filteredMyTasks = myTasks.filter(t => {
    const q = taskSearch.toLowerCase().trim();
    const matchSearch = !q ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q);
    const matchStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;
    return matchSearch && matchStatus;
  });

  const sortedLeaderboard = [...employeeUsers].sort((a, b) => b.points - a.points);
  const filteredLeaderboard = sortedLeaderboard.filter(u => {
    if (!leaderboardSearch.trim()) return true;
    const q = leaderboardSearch.toLowerCase().trim();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
  });

  const myRankIndex = currentUser ? sortedLeaderboard.findIndex(u => 
    Number(u.id) === Number(currentUser.id)
  ) : -1;

  const myHistory = currentUser ? history.filter(h => h.user_id === currentUser.id) : [];
  const filteredHistory = myHistory.filter(h => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase().trim();
    return (
      h.reason.toLowerCase().includes(q) ||
      String(h.change).includes(q) ||
      new Date(h.created_at).toLocaleString().toLowerCase().includes(q)
    );
  });

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fafbfc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-primary), -apple-system, sans-serif'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#0f172a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 1: EMPLOYEE LOGIN SCREEN (Exact Vashik Style)
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fafbfc',
        color: '#0f172a',
        fontFamily: 'var(--font-primary), -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative'
      }}>
        {/* Return to Landing Page */}
        <Link
          href="/"
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <ArrowLeft size={15} />
          Back to VASHIK Website
        </Link>

        {/* Login Card */}
        <div style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Image
              src="/logo.png"
              alt="VASHIK Logo"
              width={48}
              height={48}
              style={{ objectFit: 'contain', margin: '0 auto 1rem' }}
              priority
            />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#64748b'
            }}>
              Internal Portal
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', marginTop: '0.2rem' }}>
              Employee Sign In
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Access your deliverables, countdown timers, and points standing.
            </p>
          </div>

          {loginError && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <AlertTriangle size={15} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} suppressHydrationWarning>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1e293b' }}>
                Username or Work Email
              </label>
              <input
                type="text"
                required
                suppressHydrationWarning
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="e.g. karthik"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.875rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  color: '#0f172a',
                  outline: 'none',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1e293b' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  suppressHydrationWarning
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.5rem 0.65rem 0.875rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    color: '#0f172a',
                    outline: 'none',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                transition: 'all 0.2s'
              }}
            >
              Sign In to Employee Portal
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#64748b'
          }}>
            VASHIK TECHNOLOGY • Enterprise Portal
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: FORCED PASSWORD RESET SCREEN (Exact Vashik Style)
  // ----------------------------------------------------
  if (currentUser.must_change_password) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fafbfc',
        color: '#0f172a',
        fontFamily: 'var(--font-primary), -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Lock size={26} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
              First-Time Password Update
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Hello <strong>{currentUser.name}</strong>. Please create your private password before entering the portal.
            </p>
          </div>

          {forcePassError && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              border: '1px solid #fecaca'
            }}>
              {forcePassError}
            </div>
          )}

          <form onSubmit={handleForcedPasswordSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showForceNewPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={forceNewPass}
                  onChange={e => setForceNewPass(e.target.value)}
                  placeholder="Minimum 8 characters"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.5rem 0.65rem 0.875rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowForceNewPass(!showForceNewPass)}
                  title={showForceNewPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                >
                  {showForceNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showForceConfirmPass ? 'text' : 'password'}
                  required
                  value={forceConfirmPass}
                  onChange={e => setForceConfirmPass(e.target.value)}
                  placeholder="Re-enter password"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.5rem 0.65rem 0.875rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowForceConfirmPass(!showForceConfirmPass)}
                  title={showForceConfirmPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                >
                  {showForceConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Set Password & Enter Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: AUTHENTICATED EMPLOYEE PORTAL (Vashik Style)
  // ----------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafbfc',
      color: '#0f172a',
      fontFamily: 'var(--font-primary), -apple-system, sans-serif'
    }}>
      {/* Top Navbar */}
      <header className="vashik-emp-header" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {/* Header Row: Logo, Link, and User Profile / Logout */}
          <div className="vashik-header-row" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRight: '1px solid #e2e8f0',
                  paddingRight: '0.85rem'
                }}
              >
                <ArrowLeft size={14} />
                <span>Site</span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Image
                  src="/logo.png"
                  alt="VASHIK Logo"
                  width={28}
                  height={28}
                  style={{ objectFit: 'contain' }}
                />
                <span style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: '1.05rem', color: '#0f172a' }}>
                  VASHIK PORTAL
                </span>
              </div>
            </div>

            {/* Right: Points, User Info & Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* Points Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                border: '1px solid #e2e8f0'
              }}>
                <Zap size={13} style={{ fill: '#0f172a' }} />
                <span>{currentUser.points} pts</span>
              </div>

              {/* User Profile */}
              <div style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', paddingLeft: '0.65rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{currentUser.name}</div>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>@{currentUser.username}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  padding: '0.35rem 0.55rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav className="vashik-tabs-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            paddingBottom: '0.25rem'
          }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                backgroundColor: activeTab === 'dashboard' ? '#0f172a' : 'transparent',
                color: activeTab === 'dashboard' ? '#ffffff' : '#64748b'
              }}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                backgroundColor: activeTab === 'tasks' ? '#0f172a' : 'transparent',
                color: activeTab === 'tasks' ? '#ffffff' : '#64748b'
              }}
            >
              My Deliverables ({myTasks.length})
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: activeTab === 'announcements' ? '#0f172a' : 'transparent',
                color: activeTab === 'announcements' ? '#ffffff' : '#64748b'
              }}
            >
              <Megaphone size={12} />
              <span>Announcements ({announcements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                backgroundColor: activeTab === 'leaderboard' ? '#0f172a' : 'transparent',
                color: activeTab === 'leaderboard' ? '#ffffff' : '#64748b'
              }}
            >
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                backgroundColor: activeTab === 'profile' ? '#0f172a' : 'transparent',
                color: activeTab === 'profile' ? '#ffffff' : '#64748b'
              }}
            >
              Profile & Points
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {/* ==============================================
            TAB: DASHBOARD
            ============================================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Hero Welcome Banner */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.1em'
                }}>
                  VASHIK Engineering Workspace
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.2rem', color: '#0f172a' }}>
                  Welcome back, {currentUser.name}!
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '600px', marginTop: '0.35rem' }}>
                  Complete assigned tasks before deadlines to earn <strong>+5 bonus points</strong>. If a task passes its deadline without completion, <strong>10 points</strong> are automatically deducted by the system.
                </p>
              </div>

              {/* Points Card */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem 2rem',
                textAlign: 'center',
                minWidth: '180px'
              }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Current Standing
                </span>
                <div style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                  margin: '0.2rem 0'
                }}>
                  {currentUser.points} pts
                </div>
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                  Base 100 • Non-negative
                </span>
              </div>
            </div>

            {/* Quick Stat Counters */}
            <div className="vashik-grid-kpi" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pending Deliverables
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#b45309' }}>
                  {myTasks.filter(t => t.status === 'Pending').length}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Completed Tasks
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#166534' }}>
                  {myTasks.filter(t => t.status === 'Completed').length}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Overdue Penalties (-10 pts)
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#991b1b' }}>
                  {myTasks.filter(t => t.status === 'Overdue').length}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Company Rank
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#0f172a' }}>
                  #{myRankIndex >= 0 ? myRankIndex + 1 : '—'}
                </div>
              </div>
            </div>

            {/* Announcements Notice Banner */}
            {announcements.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                border: announcements[0].is_pinned ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
                        Company Notice • {announcements[0].category}
                      </span>
                      {announcements[0].is_pinned && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                          Featured Notice
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0.15rem 0' }}>
                      {announcements[0].title}
                    </div>
                    <p style={{
                      fontSize: '0.8125rem',
                      color: '#64748b',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {announcements[0].body}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {announcements[0].buttons && announcements[0].buttons.length > 0 && (
                    <a
                      href={announcements[0].buttons[0].url}
                      target={announcements[0].buttons[0].url.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '9999px',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <span>{announcements[0].buttons[0].label}</span>
                      <ArrowRight size={12} />
                    </a>
                  )}

                  <button
                    onClick={() => setActiveTab('announcements')}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: '9999px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View All ({announcements.length}) →
                  </button>
                </div>
              </div>
            )}

            {/* Active Deliverables with Live Countdown Timers */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                  Active Deliverables & Deadlines
                </h2>
                <button
                  onClick={() => setActiveTab('tasks')}
                  style={{ background: 'none', border: 'none', color: '#0f172a', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  View All Deliverables →
                </button>
              </div>

              <div className="vashik-grid-tasks" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem'
              }}>
                {myTasks.length === 0 ? (
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    gridColumn: '1 / -1'
                  }}>
                    <CheckCircle size={36} color="#64748b" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No tasks assigned yet</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      When a manager assigns a deliverable, it will appear here with live deadline tracking.
                    </p>
                  </div>
                ) : (
                  myTasks.slice(0, 4).map(task => (
                    <div
                      key={task.id}
                      onClick={() => { setSelectedTask(task); setTaskFeedbackMsg(null); }}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            backgroundColor: task.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                            color: task.priority === 'High' ? '#991b1b' : '#334155'
                          }}>
                            {task.priority} Priority
                          </span>

                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: task.status === 'Completed' ? '#166534' : task.status === 'Overdue' ? '#991b1b' : '#b45309'
                          }}>
                            {getCountdownString(task.deadline, task.status)}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', marginBottom: '0.4rem' }}>
                          {task.title}
                        </h3>
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#64748b',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {task.description}
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '0.85rem',
                        marginTop: '1rem',
                        fontSize: '0.75rem',
                        color: '#64748b'
                      }}>
                        <span>Deadline: {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>Open Deliverable →</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================
            TAB: MY TASKS
            ============================================== */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>
                  My Assigned Deliverables
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Review acceptance criteria, access files & links, and submit completion notes.
                </p>
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#ffffff', padding: '3px', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
                {(['all', 'Pending', 'Completed', 'Overdue'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setTaskStatusFilter(s)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: taskStatusFilter === s ? '#0f172a' : 'transparent',
                      color: taskStatusFilter === s ? '#ffffff' : '#64748b'
                    }}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={taskSearch}
                  onChange={e => setTaskSearch(e.target.value)}
                  placeholder="Search deliverables by title, description, priority, or status..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.2rem 0.65rem 2.4rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
                {taskSearch && (
                  <button
                    onClick={() => setTaskSearch('')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Showing {filteredMyTasks.length} of {myTasks.length} assigned task{myTasks.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Task Grid */}
            <div className="vashik-grid-tasks" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}>
              {filteredMyTasks.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '14px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: '#64748b'
                }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.35rem' }}>No deliverables match your search</p>
                  <p style={{ fontSize: '0.8125rem' }}>Try clearing the search query or status filter.</p>
                </div>
              ) : (
                filteredMyTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setTaskFeedbackMsg(null); }}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: task.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                          color: task.priority === 'High' ? '#991b1b' : '#334155'
                        }}>
                          {task.priority} Priority
                        </span>

                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: task.status === 'Completed' ? '#166534' : task.status === 'Overdue' ? '#991b1b' : '#b45309'
                        }}>
                          {getCountdownString(task.deadline, task.status)}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                        {task.title}
                      </h3>
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#64748b',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                      }}>
                        {task.description}
                      </p>

                      {/* Full Info Assignment Box */}
                      <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.65rem 0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        fontSize: '0.72rem',
                        color: '#475569',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Assigned When:</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {formatFullDateTime(task.created_at)} {formatRelativeTime(task.created_at) && `(${formatRelativeTime(task.created_at)})`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Due Target:</span>
                          <span style={{ fontWeight: 700, color: task.status === 'Overdue' ? '#991b1b' : '#0f172a' }}>
                            {formatFullDateTime(task.deadline)}
                          </span>
                        </div>
                        {task.completed_at && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#166534' }}>Completed At:</span>
                            <span style={{ fontWeight: 700, color: '#166534' }}>
                              {formatFullDateTime(task.completed_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '0.85rem',
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      <span>{task.attachments.length} attachments • {task.comments.length} comments</span>
                      <span style={{ color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Info size={14} /> Full Info →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==============================================
            TAB: ANNOUNCEMENTS
            ============================================== */}
        {activeTab === 'announcements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Official Company Announcements
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  Updates, milestone alerts, and notices published by VASHIK leadership.
                </p>
              </div>

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
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <span>Open Full Page View</span>
                  <ExternalLink size={13} color="#64748b" />
                </Link>
            </div>

            {/* Filter & Search Bar */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '400px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={announcementSearch}
                  onChange={e => setAnnouncementSearch(e.target.value)}
                  placeholder="Search announcements..."
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
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Filter:</span>
                <select
                  value={announcementCategoryFilter}
                  onChange={e => setAnnouncementCategoryFilter(e.target.value)}
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
                  <option value="all">All Categories</option>
                  <option value="Company Update">Company Update</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Event">Event</option>
                  <option value="Urgent">Urgent</option>
                  <option value="General">General</option>
                  <option value="Policy">Policy</option>
                </select>
              </div>
            </div>

            {/* Announcements Feed */}
            {(() => {
              const list = announcements.filter(a => {
                const q = announcementSearch.toLowerCase();
                const matches = a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
                const matchesCat = announcementCategoryFilter === 'all' || a.category === announcementCategoryFilter;
                return matches && matchesCat;
              });

              if (list.length === 0) {
                return (
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '3rem 2rem',
                    textAlign: 'center'
                  }}>
                    <Megaphone size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                      No announcements found
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                      No announcements match your search filters.
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {list.map(ann => (
                    <article
                      key={ann.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: ann.is_pinned ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                        boxShadow: ann.is_pinned ? '0 4px 16px rgba(245, 158, 11, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                        padding: '1.5rem',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            textTransform: 'uppercase'
                          }}>
                            {ann.category}
                          </span>

                          {ann.is_pinned && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fde68a',
                              color: '#b45309'
                            }}>
                              <Pin size={11} style={{ transform: 'rotate(45deg)' }} />
                              Featured Notice
                            </span>
                          )}
                        </div>

                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                        {ann.title}
                      </h2>

                      <p style={{
                        fontSize: '0.875rem',
                        lineHeight: 1.65,
                        color: '#334155',
                        whiteSpace: 'pre-line',
                        margin: '0 0 1rem 0'
                      }}>
                        {ann.body}
                      </p>

                      {ann.buttons && ann.buttons.length > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          paddingTop: '1rem',
                          borderTop: '1px solid #f1f5f9'
                        }}>
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
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                backgroundColor: btn.variant === 'secondary' ? '#f1f5f9' : btn.variant === 'outline' ? '#ffffff' : '#0f172a',
                                color: btn.variant === 'outline' ? '#2563eb' : btn.variant === 'secondary' ? '#0f172a' : '#ffffff',
                                border: btn.variant === 'outline' ? '1.5px solid #2563eb' : '1px solid transparent'
                              }}
                            >
                              <span>{btn.label}</span>
                              <ArrowRight size={12} />
                            </a>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ==============================================
            TAB: LEADERBOARD
            ============================================== */}
        {activeTab === 'leaderboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>
                  Company Performance Standings
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Base score 100. Earn +5 bonus points for on-time completion. Overdue tasks deduct 10 points.
                </p>
              </div>

              <div style={{ display: 'flex', backgroundColor: '#ffffff', padding: '3px', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
                {(['all', 'month', 'week'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setLeaderboardPeriod(p)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: leaderboardPeriod === p ? '#0f172a' : 'transparent',
                      color: leaderboardPeriod === p ? '#ffffff' : '#64748b'
                    }}
                  >
                    {p === 'all' ? 'All-Time' : p === 'month' ? 'This Month' : 'This Week'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Colleague Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={leaderboardSearch}
                  onChange={e => setLeaderboardSearch(e.target.value)}
                  placeholder="Search colleagues by name, @username, or department..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.2rem 0.65rem 2.4rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
                {leaderboardSearch && (
                  <button
                    onClick={() => setLeaderboardSearch('')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Showing {filteredLeaderboard.length} of {employeeUsers.length} colleague{employeeUsers.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* My Rank Highlight Card */}
            {myRankIndex >= 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                borderRadius: '16px',
                padding: '1.5rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.25rem'
                  }}>
                    #{myRankIndex + 1}
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>Your Current Rank</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                      {currentUser.name} (@{currentUser.username}) • {currentUser.department}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Points Balance</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                    {currentUser.points} pts
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 Podium Highlights */}
            {filteredLeaderboard.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}>
                {filteredLeaderboard.slice(0, 3).map((u, i) => {
                  const medals = ['🥇 1st Place (Gold)', '🥈 2nd Place (Silver)', '🥉 3rd Place (Bronze)'];
                  return (
                    <div
                      key={u.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                          {medals[i] || `#${i + 1}`}
                        </span>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: '#f1f5f9',
                          fontWeight: 800,
                          color: '#0f172a',
                          fontSize: '0.85rem'
                        }}>
                          {u.points} pts
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{u.name}</h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>@{u.username} • {u.department}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Standings Table */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflowX: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              {filteredLeaderboard.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.35rem' }}>No colleagues match "{leaderboardSearch}"</p>
                  <p style={{ fontSize: '0.8125rem' }}>Try searching by first name, username handle, or department name.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.85rem 1.25rem', width: '80px' }}>Rank</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Personnel</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Department</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboard.map((u, idx) => {
                      const actualRank = sortedLeaderboard.findIndex(x => x.id === u.id);
                      return (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: u.id === currentUser?.id ? '#f8fafc' : 'transparent',
                            fontWeight: u.id === currentUser?.id ? 700 : 'normal'
                          }}
                        >
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800 }}>#{actualRank >= 0 ? actualRank + 1 : idx + 1}</td>
                          <td style={{ padding: '0.85rem 1.25rem' }}>
                            <div>{u.name} {u.id === currentUser?.id && <span style={{ color: '#166534', fontSize: '0.75rem' }}>(You)</span>}</div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username}</span>
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{u.department}</td>
                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            {u.points} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ==============================================
            TAB: PROFILE & POINTS LEDGER
            ============================================== */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>
                  {currentUser.name}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  @{currentUser.username} • {currentUser.email} • {currentUser.department}
                </p>
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem 2rem',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Current Score
                </span>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentUser.points} pts
                </div>
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Non-negative ledger</span>
              </div>
            </div>

            {/* Points Audit Ledger */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem', color: '#0f172a' }}>
                    Points Audit Ledger & History
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                    Verifiable record of bonuses (+5), overdue penalties (-10), and adjustments.
                  </p>
                </div>

                {/* History Search */}
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    placeholder="Search ledger entries..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 2rem 0.5rem 2.2rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                  {historySearch && (
                    <button
                      onClick={() => setHistorySearch('')}
                      style={{
                        position: 'absolute',
                        right: '0.65rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredHistory.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    {historySearch ? `No ledger entries match "${historySearch}"` : 'No points entries recorded yet.'}
                  </div>
                ) : (
                  filteredHistory.map(h => (
                    <div
                      key={h.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{h.reason}</div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {new Date(h.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: h.change >= 0 ? '#166534' : '#991b1b'
                        }}>
                          {h.change >= 0 ? `+${h.change}` : h.change} pts
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                          Balance: {h.balance_after}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: selectedTask.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                  color: selectedTask.priority === 'High' ? '#991b1b' : '#334155',
                  marginRight: '0.5rem'
                }}>
                  {selectedTask.priority} Priority
                </span>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: selectedTask.status === 'Completed' ? '#166534' : selectedTask.status === 'Overdue' ? '#991b1b' : '#b45309'
                }}>
                  {getCountdownString(selectedTask.deadline, selectedTask.status)}
                </span>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem', color: '#0f172a' }}>
                  {selectedTask.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {taskFeedbackMsg && (
              <div style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                fontWeight: 600
              }}>
                {taskFeedbackMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Full Assignment Accountability Dossier */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                fontSize: '0.8125rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <UserCheck size={13} /> Assigned Colleague
                  </span>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                    {currentUser.name}
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    @{currentUser.username} • {currentUser.department}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, display: 'block' }}>
                    📅 Assigned When
                  </span>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                    {formatFullDateTime(selectedTask.created_at)}
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {formatRelativeTime(selectedTask.created_at) ? `Delegated ${formatRelativeTime(selectedTask.created_at)}` : 'Recorded in system'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, display: 'block' }}>
                    ⏰ Target Due Date
                  </span>
                  <div style={{ fontWeight: 700, color: selectedTask.status === 'Overdue' ? '#991b1b' : '#0f172a', marginTop: '0.2rem' }}>
                    {formatFullDateTime(selectedTask.deadline)}
                  </div>
                  <span style={{ color: selectedTask.status === 'Overdue' ? '#991b1b' : '#64748b', fontSize: '0.75rem', fontWeight: selectedTask.status === 'Overdue' ? 700 : 400 }}>
                    {getCountdownString(selectedTask.deadline, selectedTask.status)}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, display: 'block' }}>
                    🏆 Points Impact
                  </span>
                  <div style={{ fontWeight: 700, color: '#166534', marginTop: '0.2rem' }}>
                    +5 pts (On-time bonus)
                  </div>
                  <span style={{ color: '#991b1b', fontSize: '0.72rem' }}>
                    -10 pts if overdue
                  </span>
                </div>

                {selectedTask.completed_at && (
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={15} /> Submission Verified
                    </span>
                    <span style={{ color: '#166534', fontWeight: 700 }}>
                      Completed: {formatFullDateTime(selectedTask.completed_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px', fontSize: '0.875rem', lineHeight: 1.6, color: '#334155' }}>
                <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Deliverable Description & Requirements
                </h4>
                {selectedTask.description}
              </div>

              {/* Attachments */}
              {selectedTask.attachments.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Attachments & Resources</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {selectedTask.attachments.map(att => (
                      <div
                        key={att.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{att.original_name || 'Resource'}</span>
                        <a
                          href={att.url_or_path}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          Open <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Action */}
              {selectedTask.status !== 'Completed' && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>
                    Mark Deliverable as Completed
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
                    ✓ Receive +5 points bonus if submitted before deadline
                  </span>
                  <textarea
                    rows={2}
                    placeholder="Add completion notes, deployment links, or confirmation notes..."
                    value={completionNote}
                    onChange={e => setCompletionNote(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.8125rem',
                      marginBottom: '0.75rem'
                    }}
                  />
                  <button
                    onClick={() => handleMarkTaskComplete(selectedTask.id)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Submit Completion
                  </button>
                </div>
              )}

              {/* Discussion Thread */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                  Discussion & Feedback ({selectedTask.comments.length})
                </h4>
                <div style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem',
                  borderRadius: '10px'
                }}>
                  {selectedTask.comments.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>No comments yet.</span>
                  ) : (
                    selectedTask.comments.map(c => (
                      <div key={c.id} style={{ fontSize: '0.8rem' }}>
                        <strong style={{ color: '#0f172a' }}>{c.user_name} ({c.user_role}):</strong>{' '}
                        <span style={{ color: '#475569' }}>{c.message}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Type an update or reply..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.8125rem'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 0.85rem',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Global Mobile Styles */}
      <style>{`
        @media (max-width: 768px) {
          .vashik-emp-header {
            padding: 0.65rem 0.85rem !important;
          }
          .vashik-header-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
          }
          .vashik-tabs-nav {
            overflow-x: auto !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            width: 100% !important;
            padding-bottom: 0.25rem !important;
            gap: 0.35rem !important;
          }
          .vashik-tabs-nav::-webkit-scrollbar {
            display: none !important;
          }
          .vashik-tabs-nav > button {
            flex-shrink: 0 !important;
          }
          .vashik-grid-kpi {
            grid-template-columns: 1fr !important;
          }
          .vashik-grid-tasks {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
