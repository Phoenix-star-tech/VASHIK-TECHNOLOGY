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
  generatePassword
} from './PortalState';
import { isSupabaseConfigured, getSupabaseConfig, getSupabaseClient } from '@/lib/supabase';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  PlusCircle,
  Download,
  Search,
  RotateCcw,
  Trash2,
  Zap,
  Activity,
  Trophy,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Send,
  Award,
  ChevronRight,
  ArrowLeft,
  X,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';

export default function PortalView() {
  const [currentUser, setCurrentUser] = useState<PortalUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'tasks' | 'leaderboard' | 'profile'>('dashboard');
  const [loginRole, setLoginRole] = useState<'employee' | 'admin'>('employee');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Login form state
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
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('all');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'all' | 'month' | 'week'>('all');

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PortalTask | null>(null);

  // Add Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpUsername, setNewEmpUsername] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [genPass, setGenPass] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);
  const [empCreatedNotice, setEmpCreatedNotice] = useState<{ name: string; username: string; pass: string } | null>(null);

  // Create Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskLinks, setTaskLinks] = useState<string[]>(['']);
  const [taskRecurring, setTaskRecurring] = useState(false);
  const [taskRecurRule, setTaskRecurRule] = useState('weekly');

  // Task Completion & Chat State
  const [completionNote, setCompletionNote] = useState('');
  const [newComment, setNewComment] = useState('');
  const [taskFeedbackMsg, setTaskFeedbackMsg] = useState<string | null>(null);

  // Manual points adjust modal
  const [pointsModal, setPointsModal] = useState<{ open: boolean; user: PortalUser | null; amount: number; reason: string }>({
    open: false,
    user: null,
    amount: 10,
    reason: ''
  });

  // Password Reset Alert
  const [resetPassAlert, setResetPassAlert] = useState<{ username: string; pass: string } | null>(null);

  // Supabase Database Connection State
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);

  // Initial Load & Automatic 1-Minute Overdue Scheduler
  useEffect(() => {
    refreshAllData();
    const session = PortalStorage.getSessionUser();
    if (session) setCurrentUser(session);

    // Check Supabase configuration
    const isConfigured = isSupabaseConfigured();
    setSupabaseConnected(isConfigured);
    const cfg = getSupabaseConfig();
    setSupabaseUrlInput(cfg.url);
    setSupabaseKeyInput(cfg.anonKey);

    if (isConfigured) {
      PortalStorage.syncFromSupabase().then(success => {
        if (success) {
          refreshAllData();
          setSupabaseStatusMsg('Synchronized live data from Supabase successfully.');
        }
      });
    }

    // Initial check on load
    PortalStorage.checkAndProcessOverdue();
    refreshAllData();

    // 1-minute interval background scheduler
    const interval = setInterval(() => {
      const changed = PortalStorage.checkAndProcessOverdue();
      if (changed) {
        refreshAllData();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const refreshAllData = () => {
    setUsers(PortalStorage.getUsers());
    setTasks(PortalStorage.getTasks());
    setHistory(PortalStorage.getHistory());
    setNotifications(PortalStorage.getNotifications());
    const sess = PortalStorage.getSessionUser();
    if (sess) {
      const updated = PortalStorage.getUsers().find(u => u.id === sess.id);
      if (updated) setCurrentUser(updated);
    }
  };

  // Toggle role in login view
  const handleRoleSelect = (role: 'employee' | 'admin') => {
    setLoginRole(role);
    setLoginError(null);
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const found = users.find(
      u => (u.username.toLowerCase() === loginUsername.trim().toLowerCase() || u.email.toLowerCase() === loginUsername.trim().toLowerCase()) &&
           u.role === loginRole
    );

    if (!found) {
      setLoginError(`Invalid username or account not registered under ${loginRole} portal.`);
      return;
    }

    if (!found.is_active) {
      setLoginError('Account has been deactivated. Please contact your administrator.');
      return;
    }

    if (found.password_plain && found.password_plain !== loginPassword.trim()) {
      setLoginError('Incorrect password. Please verify your credentials.');
      return;
    }

    // Success
    PortalStorage.setSessionUser(found);
    setCurrentUser(found);
    PortalStorage.logAudit('USER_LOGIN', `Successful login: @${found.username} (${found.role})`);
  };

  const handleLogout = () => {
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
    PortalStorage.logAudit('FORCED_PASSWORD_CHANGED', `First-time password updated for @${currentUser.username}`);
    refreshAllData();
  };

  // Add Employee Handler
  const handleOpenAddEmp = () => {
    const p = generatePassword('emp');
    setGenPass(p);
    setNewEmpName('');
    setNewEmpUsername('');
    setNewEmpEmail('');
    setNewEmpDept('Engineering');
    setNewEmpPhone('');
    setEmpCreatedNotice(null);
    setCopiedPass(false);
    setShowAddEmpModal(true);
  };

  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = users.find(u => u.username.toLowerCase() === newEmpUsername.trim().toLowerCase());
    if (existing) {
      alert(`Username @${newEmpUsername} is already registered.`);
      return;
    }

    const newUser: PortalUser = {
      id: Date.now(),
      name: newEmpName.trim(),
      username: newEmpUsername.trim().toLowerCase(),
      email: newEmpEmail.trim().toLowerCase(),
      role: 'employee',
      department: newEmpDept,
      phone: newEmpPhone.trim(),
      points: 100,
      is_active: true,
      must_change_password: true, // Requires first login password change
      password_plain: genPass,
      created_at: new Date().toISOString()
    };

    const updated = [...users, newUser];
    PortalStorage.setUsers(updated);

    // Initial welcome points history
    const allHistory = PortalStorage.getHistory();
    allHistory.unshift({
      id: Date.now() + 1,
      user_id: newUser.id,
      change: 100,
      balance_after: 100,
      reason: 'Welcome allocation: Base account points balance',
      created_at: new Date().toISOString()
    });
    PortalStorage.setHistory(allHistory);

    PortalStorage.logAudit('EMPLOYEE_CREATED', `Admin registered employee @${newUser.username} (${newUser.name})`);

    setEmpCreatedNotice({
      name: newUser.name,
      username: newUser.username,
      pass: genPass
    });

    refreshAllData();
  };

  // Create Task Handler
  const handleOpenCreateTask = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskLinks(['']);
    setTaskPriority('Medium');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    setTaskDeadline(tomorrow.toISOString().slice(0, 16));
    if (users.filter(u => u.role === 'employee').length > 0) {
      setTaskAssignee(users.filter(u => u.role === 'employee')[0].username);
    }
    setShowCreateTaskModal(true);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = users.find(u => u.username === taskAssignee);
    if (!emp) {
      alert('Selected employee not found.');
      return;
    }

    const validLinks = taskLinks.filter(l => l.trim().length > 0);
    const newTask: PortalTask = {
      id: Date.now(),
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      assigned_to: emp.id,
      assigned_to_name: emp.name,
      assigned_to_username: emp.username,
      created_by: currentUser?.id,
      deadline: new Date(taskDeadline).toISOString(),
      priority: taskPriority,
      status: 'Pending',
      points_deducted: false,
      points_bonus_awarded: false,
      is_recurring: taskRecurring,
      recurrence_rule: taskRecurring ? taskRecurRule : undefined,
      attachments: validLinks.map((link, idx) => ({
        id: Date.now() + idx,
        task_id: 0,
        type: 'link',
        url_or_path: link.trim(),
        original_name: 'External Specification',
        created_at: new Date().toISOString()
      })),
      comments: [],
      created_at: new Date().toISOString()
    };

    const allTasks = [newTask, ...tasks];
    PortalStorage.setTasks(allTasks);

    // Notification
    const notifs = PortalStorage.getNotifications();
    notifs.unshift({
      id: Date.now(),
      user_id: emp.id,
      type: 'task_assigned',
      message: `New task assigned: "${newTask.title}". Deadline: ${new Date(newTask.deadline).toLocaleString()}`,
      task_id: newTask.id,
      is_read: false,
      created_at: new Date().toISOString()
    });
    PortalStorage.setNotifications(notifs);

    PortalStorage.logAudit('TASK_CREATED', `Task #${newTask.id} assigned to @${emp.username}`);
    refreshAllData();
    setShowCreateTaskModal(false);
  };

  // Complete Task Handler
  const handleMarkTaskComplete = (taskId: number) => {
    const allTasks = PortalStorage.getTasks();
    const target = allTasks.find(t => t.id === taskId);
    if (!target || target.status === 'Completed') return;

    const now = Date.now();
    const isBeforeDeadline = now <= new Date(target.deadline).getTime();
    let bonusAwarded = false;

    // Apply +5 bonus if completed before deadline
    if (isBeforeDeadline && !target.points_bonus_awarded && !target.points_deducted) {
      const allUsers = PortalStorage.getUsers();
      const emp = allUsers.find(u => u.id === target.assigned_to);
      if (emp) {
        emp.points += 5;
        bonusAwarded = true;
        PortalStorage.setUsers(allUsers);

        // History
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
    target.completion_note = completionNote.trim() || 'Deliverables verified and submitted.';
    target.points_bonus_awarded = bonusAwarded;

    PortalStorage.setTasks(allTasks);
    PortalStorage.logAudit('TASK_COMPLETED', `Task #${target.id} completed. Bonus: ${bonusAwarded ? '+5 pts' : 'None'}`);

    setTaskFeedbackMsg(
      bonusAwarded
        ? '✓ Task completed before deadline! +5 bonus points awarded.'
        : '✓ Task marked as completed.'
    );

    refreshAllData();
    setSelectedTask({ ...target });
  };

  // Add Comment Handler
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

    setNewComment('');
    setSelectedTask({ ...taskObj });
    refreshAllData();
  };

  // Manual Points Adjustment
  const handleSavePointsAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointsModal.user) return;

    const allUsers = PortalStorage.getUsers();
    const target = allUsers.find(u => u.id === pointsModal.user!.id);
    if (!target) return;

    const oldPoints = target.points;
    target.points = Math.max(0, target.points + pointsModal.amount);
    const diff = target.points - oldPoints;
    PortalStorage.setUsers(allUsers);

    const allHist = PortalStorage.getHistory();
    allHist.unshift({
      id: Date.now(),
      user_id: target.id,
      change: diff,
      balance_after: target.points,
      reason: `Admin adjustment: ${pointsModal.reason}`,
      created_at: new Date().toISOString()
    });
    PortalStorage.setHistory(allHist);

    PortalStorage.logAudit('MANUAL_POINTS_ADJUST', `Adjusted @${target.username} by ${diff} pts. Reason: ${pointsModal.reason}`);

    setPointsModal({ open: false, user: null, amount: 10, reason: '' });
    refreshAllData();
  };

  // Reset Password for Employee
  const handleResetPassword = (emp: PortalUser) => {
    const p = generatePassword(emp.username);
    const allUsers = PortalStorage.getUsers();
    const target = allUsers.find(u => u.id === emp.id);
    if (target) {
      target.password_plain = p;
      target.must_change_password = true;
      PortalStorage.setUsers(allUsers);
      PortalStorage.logAudit('PASSWORD_RESET', `Admin reset password for @${emp.username}`);
      setResetPassAlert({ username: emp.username, pass: p });
      refreshAllData();
    }
  };

  // Export CSV
  const handleExportCSV = (type: 'employees' | 'tasks' | 'points') => {
    let csv = '';
    let filename = `vashik_${type}_${Date.now()}.csv`;

    if (type === 'employees') {
      csv = 'Name,Username,Email,Department,Points,Active\n';
      users.filter(u => u.role === 'employee').forEach(u => {
        csv += `"${u.name}","${u.username}","${u.email}","${u.department}",${u.points},${u.is_active}\n`;
      });
    } else if (type === 'tasks') {
      csv = 'TaskID,Title,AssignedTo,Priority,Status,Deadline\n';
      tasks.forEach(t => {
        csv += `"${t.id}","${t.title}","${t.assigned_to_username}","${t.priority}","${t.status}","${t.deadline}"\n`;
      });
    } else {
      csv = 'UserID,Change,BalanceAfter,Reason,Date\n';
      history.forEach(h => {
        csv += `"${h.user_id}",${h.change},${h.balance_after},"${h.reason}","${h.created_at}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Countdown Helper
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
    return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Filtered views
  const employeeUsers = users.filter(u => u.role === 'employee');
  const filteredEmployees = employeeUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(empSearch.toLowerCase()) || u.username.toLowerCase().includes(empSearch.toLowerCase());
    const matchDept = empDeptFilter === 'all' || u.department === empDeptFilter;
    return matchSearch && matchDept;
  });

  const visibleTasks = currentUser?.role === 'employee'
    ? tasks.filter(t => t.assigned_to === currentUser.id)
    : tasks;

  const filteredTasks = visibleTasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase());
    const matchStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;
    return matchSearch && matchStatus;
  });

  // Leaderboard ranking
  const sortedLeaderboard = [...employeeUsers].sort((a, b) => b.points - a.points);
  const userRankIndex = currentUser ? sortedLeaderboard.findIndex(u => u.id === currentUser.id) : -1;

  // ----------------------------------------------------
  // VIEW 1: NOT LOGGED IN (Role Switcher + Login Screen)
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0f1d',
        color: '#f8fafc',
        fontFamily: 'var(--font-primary), sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative'
      }}>
        {/* Back to Website Button */}
        <Link
          href="/"
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <ArrowLeft size={16} />
          Back to VASHIK Website
        </Link>

        {/* Card */}
        <div style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#111827',
          borderRadius: '16px',
          border: '1px solid #1f293d',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              {loginRole === 'admin' ? <ShieldCheck size={28} /> : <Users size={28} />}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              VASHIK Portal
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {loginRole === 'admin' ? 'Administrator Suite & Team Control' : 'Personnel Deliverables & Points Center'}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#1a2234',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '1.75rem',
            border: '1px solid #243048'
          }}>
            <button
              onClick={() => handleRoleSelect('employee')}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                backgroundColor: loginRole === 'employee' ? '#2563eb' : 'transparent',
                color: loginRole === 'employee' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              Employee Login
            </button>
            <button
              onClick={() => handleRoleSelect('admin')}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                backgroundColor: loginRole === 'admin' ? '#2563eb' : 'transparent',
                color: loginRole === 'admin' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              Admin Login
            </button>
          </div>

          {loginError && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
                {loginRole === 'admin' ? 'Admin Username' : 'Employee Username or Email'}
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.875rem',
                  backgroundColor: '#1a2234',
                  border: '1px solid #243048',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  outline: 'none',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.5rem 0.65rem 0.875rem',
                    backgroundColor: '#1a2234',
                    border: '1px solid #243048',
                    borderRadius: '8px',
                    color: '#f8fafc',
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
                    color: '#94a3b8',
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
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              Sign In to {loginRole === 'admin' ? 'Admin Suite' : 'Employee Portal'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: FORCED PASSWORD CHANGE ON FIRST LOGIN
  // ----------------------------------------------------
  if (currentUser.must_change_password) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0f1d',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#111827',
          borderRadius: '16px',
          border: '1px solid #1f293d',
          padding: '2.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <KeyRound size={28} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>First-Time Login Security</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Welcome <strong>{currentUser.name}</strong>. Please update your auto-generated temporary password before continuing.
            </p>
          </div>

          {forcePassError && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              marginBottom: '1rem'
            }}>
              {forcePassError}
            </div>
          )}

          <form onSubmit={handleForcedPasswordSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                New Private Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showForceNewPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={forceNewPass}
                  onChange={e => setForceNewPass(e.target.value)}
                  placeholder="At least 8 characters"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.5rem 0.65rem 0.875rem',
                    backgroundColor: '#1a2234',
                    border: '1px solid #243048',
                    borderRadius: '8px',
                    color: '#fff',
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
                    color: '#94a3b8',
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
                    backgroundColor: '#1a2234',
                    border: '1px solid #243048',
                    borderRadius: '8px',
                    color: '#fff',
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
                    color: '#94a3b8',
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
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Update Password & Enter Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: FULL AUTHENTICATED PORTAL (Admin & Employee)
  // ----------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f1d',
      color: '#f8fafc',
      fontFamily: 'var(--font-primary), sans-serif'
    }}>
      {/* Portal Top Bar */}
      <header style={{
        backgroundColor: '#111827',
        borderBottom: '1px solid #1f293d',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Logo & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRight: '1px solid #243048',
                paddingRight: '1.25rem'
              }}
            >
              <ArrowLeft size={14} />
              VASHIK Site
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                V
              </div>
              <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1rem' }}>
                {currentUser.role === 'admin' ? 'ADMIN SUITE' : 'EMPLOYEE PORTAL'}
              </span>
            </div>

            {/* Nav Tabs */}
            <nav style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'dashboard' ? '#2563eb' : 'transparent',
                  color: activeTab === 'dashboard' ? '#ffffff' : '#94a3b8'
                }}
              >
                Dashboard
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('employees')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'employees' ? '#2563eb' : 'transparent',
                    color: activeTab === 'employees' ? '#ffffff' : '#94a3b8'
                  }}
                >
                  Employees ({employeeUsers.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab('tasks')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'tasks' ? '#2563eb' : 'transparent',
                  color: activeTab === 'tasks' ? '#ffffff' : '#94a3b8'
                }}
              >
                Tasks ({visibleTasks.length})
              </button>

              <button
                onClick={() => setActiveTab('leaderboard')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'leaderboard' ? '#2563eb' : 'transparent',
                  color: activeTab === 'leaderboard' ? '#ffffff' : '#94a3b8'
                }}
              >
                Leaderboard
              </button>

              {currentUser.role === 'employee' && (
                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'profile' ? '#2563eb' : 'transparent',
                    color: activeTab === 'profile' ? '#ffffff' : '#94a3b8'
                  }}
                >
                  Profile & Points
                </button>
              )}
            </nav>
          </div>

          {/* Right Controls: Supabase status, Points, Notifications, User Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Supabase Database Status / Configuration Button */}
            <button
              onClick={() => setShowSupabaseModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: supabaseConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: supabaseConnected ? '#34d399' : '#fbbf24',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: `1px solid ${supabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                cursor: 'pointer'
              }}
              title="Click to configure Supabase Database connection"
            >
              <Database size={13} />
              {supabaseConnected ? 'Supabase Active' : 'Connect Supabase'}
            </button>

            {/* Points pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 800,
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Zap size={14} style={{ fill: 'currentColor' }} />
              {currentUser.points} pts
            </div>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifMenu(prev => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '15px',
                    height: '15px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '320px',
                  backgroundColor: '#111827',
                  border: '1px solid #1f293d',
                  borderRadius: '10px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #1f293d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                    <button
                      onClick={() => {
                        const notifs = PortalStorage.getNotifications().map(n => ({ ...n, is_read: true }));
                        PortalStorage.setNotifications(notifs);
                        refreshAllData();
                      }}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #1f293d',
                          backgroundColor: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.08)',
                          fontSize: '0.78rem'
                        }}
                      >
                        <p style={{ margin: 0, color: '#f8fafc' }}>{n.message}</p>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Logout */}
            <div style={{ textAlign: 'right', borderLeft: '1px solid #243048', paddingLeft: '0.85rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{currentUser.name}</div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>@{currentUser.username} • {currentUser.department}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: '#1a2234',
                border: '1px solid #243048',
                color: '#94a3b8',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {/* ==============================================
            TAB: DASHBOARD
            ============================================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: '#111827',
              border: '1px solid #1f293d',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: currentUser.role === 'admin' ? '#f59e0b' : '#10b981',
                  letterSpacing: '0.05em'
                }}>
                  {currentUser.role.toUpperCase()} MODE
                </span>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {currentUser.role === 'admin' ? 'Administrative Operations Dashboard' : `Hello, ${currentUser.name}!`}
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  {currentUser.role === 'admin'
                    ? 'Oversee deliverables, team point scores, and automated overdue penalty checks.'
                    : 'Complete tasks before deadline to receive +5 bonus points. 10 points deducted for overdue tasks.'}
                </p>
              </div>

              {currentUser.role === 'admin' && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleOpenAddEmp}
                    style={{
                      padding: '0.6rem 1rem',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <UserPlus size={16} /> Add Employee
                  </button>

                  <button
                    onClick={handleOpenCreateTask}
                    style={{
                      padding: '0.6rem 1rem',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <PlusCircle size={16} /> Assign Task
                  </button>

                  <button
                    onClick={() => handleExportCSV('employees')}
                    style={{
                      padding: '0.6rem 0.85rem',
                      backgroundColor: '#1a2234',
                      color: '#94a3b8',
                      borderRadius: '8px',
                      border: '1px solid #243048',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Download size={14} /> CSV
                  </button>
                </div>
              )}
            </div>

            {/* Stat Counters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f293d', borderRadius: '12px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                  {currentUser.role === 'admin' ? 'Total Employees' : 'Your Total Points'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#3b82f6' }}>
                  {currentUser.role === 'admin' ? employeeUsers.length : `${currentUser.points} pts`}
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', border: '1px solid #1f293d', borderRadius: '12px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Pending Tasks
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#f59e0b' }}>
                  {visibleTasks.filter(t => t.status === 'Pending').length}
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', border: '1px solid #1f293d', borderRadius: '12px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Completed Tasks
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#10b981' }}>
                  {visibleTasks.filter(t => t.status === 'Completed').length}
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', border: '1px solid #1f293d', borderRadius: '12px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Overdue Penalties (-10 pts)
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#ef4444' }}>
                  {visibleTasks.filter(t => t.status === 'Overdue').length}
                </div>
              </div>
            </div>

            {/* Quick Task Grid */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {currentUser.role === 'admin' ? 'Recent Deliverables' : 'Your Assigned Deliverables'}
                </h2>
                <button
                  onClick={() => setActiveTab('tasks')}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  View All Tasks →
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem'
              }}>
                {visibleTasks.slice(0, 4).map(task => (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setTaskFeedbackMsg(null); }}
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #1f293d',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: task.status === 'Overdue' ? '4px solid #ef4444' : task.status === 'Completed' ? '4px solid #10b981' : '4px solid #3b82f6'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: task.priority === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: task.priority === 'High' ? '#fca5a5' : '#93c5fd'
                        }}>
                          {task.priority} Priority
                        </span>

                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: task.status === 'Completed' ? '#10b981' : task.status === 'Overdue' ? '#ef4444' : '#f59e0b'
                        }}>
                          {getCountdownString(task.deadline, task.status)}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', color: '#f8fafc' }}>
                        {task.title}
                      </h3>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: '#94a3b8',
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
                      borderTop: '1px solid #1f293d',
                      paddingTop: '0.75rem',
                      marginTop: '1rem',
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      <span>Assignee: @{task.assigned_to_username}</span>
                      <span style={{ color: '#3b82f6', fontWeight: 600 }}>Click for details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================
            TAB: EMPLOYEES (Admin Only)
            ============================================== */}
        {activeTab === 'employees' && currentUser.role === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Employee Personnel Management</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Manage accounts, review points scores, and auto-generate credentials.
                </p>
              </div>

              <button
                onClick={handleOpenAddEmp}
                style={{
                  padding: '0.6rem 1rem',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <UserPlus size={16} /> Add Employee
              </button>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name or username..."
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#111827',
                  border: '1px solid #1f293d',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  outline: 'none',
                  minWidth: '240px'
                }}
              />

              <select
                value={empDeptFilter}
                onChange={e => setEmpDeptFilter(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#111827',
                  border: '1px solid #1f293d',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  outline: 'none'
                }}
              >
                <option value="all">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product Architecture">Product Architecture</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Design & UI/UX">Design & UI/UX</option>
              </select>
            </div>

            {/* Table */}
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid #1f293d',
              borderRadius: '12px',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a2234', color: '#94a3b8', borderBottom: '1px solid #1f293d' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Employee</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Points Balance</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Account Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid #1f293d' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700 }}>{emp.name}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>@{emp.username} • {emp.email}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>{emp.department}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          color: '#60a5fa',
                          fontWeight: 800,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {emp.points} pts
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.45rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          backgroundColor: emp.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: emp.is_active ? '#10b981' : '#ef4444'
                        }}>
                          {emp.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => setPointsModal({ open: true, user: emp, amount: 10, reason: '' })}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: '#1a2234',
                              color: '#60a5fa',
                              border: '1px solid #243048',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <Zap size={12} /> Adjust Pts
                          </button>

                          <button
                            onClick={() => handleResetPassword(emp)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: '#1a2234',
                              color: '#94a3b8',
                              border: '1px solid #243048',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Reset Pass
                          </button>

                          <button
                            onClick={() => {
                              const all = PortalStorage.getUsers();
                              const target = all.find(u => u.id === emp.id);
                              if (target) {
                                target.is_active = !target.is_active;
                                PortalStorage.setUsers(all);
                                refreshAllData();
                              }
                            }}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: '#1a2234',
                              color: '#94a3b8',
                              border: '1px solid #243048',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            {emp.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==============================================
            TAB: TASKS
            ============================================== */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Deliverables & Task Management</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Real-time deadline countdowns, multi-format attachments, and discussion chat.
                </p>
              </div>

              {currentUser.role === 'admin' && (
                <button
                  onClick={handleOpenCreateTask}
                  style={{
                    padding: '0.6rem 1rem',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <PlusCircle size={16} /> Assign Task
                </button>
              )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#111827',
                  border: '1px solid #1f293d',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  outline: 'none',
                  minWidth: '240px'
                }}
              />

              <select
                value={taskStatusFilter}
                onChange={e => setTaskStatusFilter(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#111827',
                  border: '1px solid #1f293d',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  outline: 'none'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            {/* Task Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}>
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => { setSelectedTask(task); setTaskFeedbackMsg(null); }}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1f293d',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: task.status === 'Overdue' ? '4px solid #ef4444' : task.status === 'Completed' ? '4px solid #10b981' : '4px solid #3b82f6'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: task.priority === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: task.priority === 'High' ? '#fca5a5' : '#93c5fd'
                      }}>
                        {task.priority} Priority
                      </span>

                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: task.status === 'Completed' ? '#10b981' : task.status === 'Overdue' ? '#ef4444' : '#f59e0b'
                      }}>
                        {getCountdownString(task.deadline, task.status)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', color: '#f8fafc' }}>
                      {task.title}
                    </h3>
                    <p style={{
                      fontSize: '0.8125rem',
                      color: '#94a3b8',
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
                    borderTop: '1px solid #1f293d',
                    paddingTop: '0.75rem',
                    marginTop: '1rem',
                    fontSize: '0.75rem',
                    color: '#64748b'
                  }}>
                    <span>@{task.assigned_to_username} • {task.attachments.length} attachments</span>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>Open →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================
            TAB: LEADERBOARD
            ============================================== */}
        {activeTab === 'leaderboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={26} color="#f59e0b" />
                  Employee Standings & Performance Leaderboard
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Earn +5 points for completing tasks before deadlines. Overdue tasks automatically deduct 10 points.
                </p>
              </div>

              <div style={{ display: 'flex', backgroundColor: '#111827', padding: '4px', borderRadius: '8px', border: '1px solid #1f293d' }}>
                <button
                  onClick={() => setLeaderboardPeriod('all')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: leaderboardPeriod === 'all' ? '#2563eb' : 'transparent',
                    color: leaderboardPeriod === 'all' ? '#fff' : '#94a3b8'
                  }}
                >
                  All-Time
                </button>
                <button
                  onClick={() => setLeaderboardPeriod('month')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: leaderboardPeriod === 'month' ? '#2563eb' : 'transparent',
                    color: leaderboardPeriod === 'month' ? '#fff' : '#94a3b8'
                  }}
                >
                  This Month
                </button>
                <button
                  onClick={() => setLeaderboardPeriod('week')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: leaderboardPeriod === 'week' ? '#2563eb' : 'transparent',
                    color: leaderboardPeriod === 'week' ? '#fff' : '#94a3b8'
                  }}
                >
                  This Week
                </button>
              </div>
            </div>

            {/* Current User Highlight Banner */}
            {currentUser.role === 'employee' && userRankIndex >= 0 && (
              <div style={{
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                border: '2px solid #2563eb',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    #{userRankIndex + 1}
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Your Current Rank</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>
                      {currentUser.name} (@{currentUser.username}) • {currentUser.department}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Points Score</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
                    {currentUser.points} pts
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 Podium Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem'
            }}>
              {sortedLeaderboard.slice(0, 3).map((u, i) => {
                const medals = ['🥇 1st Place (Gold)', '🥈 2nd Place (Silver)', '🥉 3rd Place (Bronze)'];
                const borders = ['#f59e0b', '#94a3b8', '#d97706'];
                return (
                  <div
                    key={u.id}
                    style={{
                      backgroundColor: '#111827',
                      border: `2px solid ${borders[i]}`,
                      borderRadius: '12px',
                      padding: '1.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: borders[i] }}>
                        {medals[i]}
                      </span>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: '#1a2234',
                        fontWeight: 800,
                        color: '#60a5fa',
                        fontSize: '0.85rem'
                      }}>
                        {u.points} pts
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem' }}>{u.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username} • {u.department}</span>
                  </div>
                );
              })}
            </div>

            {/* Table */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f293d', borderRadius: '12px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a2234', color: '#94a3b8', borderBottom: '1px solid #1f293d' }}>
                    <th style={{ padding: '0.85rem 1rem', width: '80px' }}>Rank</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Employee</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((u, idx) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #1f293d',
                        backgroundColor: u.id === currentUser?.id ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>#{idx + 1}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700 }}>
                          {u.name} {u.id === currentUser?.id && <span style={{ color: '#10b981', fontSize: '0.7rem' }}>(You)</span>}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>{u.department}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#60a5fa' }}>{u.points} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==============================================
            TAB: PROFILE & POINTS LEDGER (Employee Only)
            ============================================== */}
        {activeTab === 'profile' && currentUser.role === 'employee' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid #1f293d',
              borderRadius: '12px',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentUser.name}</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  @{currentUser.username} • {currentUser.email} • {currentUser.department}
                </p>
              </div>

              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '1rem 1.75rem',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Current Points</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa' }}>
                  {currentUser.points} pts
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Base 100 • Non-negative</span>
              </div>
            </div>

            {/* Points Audit History */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f293d', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={18} color="#3b82f6" /> Points Audit Ledger
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                Complete verifiable record of all deductions, bonuses, and adjustments.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.filter(h => h.user_id === currentUser.id).map(h => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#1a2234',
                      borderRadius: '8px',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{h.reason}</div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: h.change >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        {h.change >= 0 ? `+${h.change}` : h.change} pts
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                        Bal: {h.balance_after}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==============================================
          MODAL: TASK DETAILS, COMPLETION & DISCUSSION
          ============================================== */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f293d',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: selectedTask.priority === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: selectedTask.priority === 'High' ? '#fca5a5' : '#93c5fd',
                  marginRight: '0.5rem'
                }}>
                  {selectedTask.priority} Priority
                </span>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: selectedTask.status === 'Completed' ? '#10b981' : selectedTask.status === 'Overdue' ? '#ef4444' : '#f59e0b'
                }}>
                  {getCountdownString(selectedTask.deadline, selectedTask.status)}
                </span>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem' }}>{selectedTask.title}</h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {taskFeedbackMsg && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#6ee7b7',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                fontWeight: 600
              }}>
                {taskFeedbackMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Description */}
              <div style={{ backgroundColor: '#1a2234', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {selectedTask.description}
              </div>

              {/* Attachments */}
              {selectedTask.attachments.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Attachments & External Links</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {selectedTask.attachments.map(att => (
                      <div
                        key={att.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#1a2234',
                          borderRadius: '6px',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <span>{att.original_name || 'Resource'}</span>
                        <a
                          href={att.url_or_path}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          Open <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mark Completed Section */}
              {selectedTask.status !== 'Completed' && (
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem', color: '#60a5fa' }}>
                    Mark as Completed (+5 Bonus if on-time)
                  </h4>
                  <textarea
                    rows={2}
                    placeholder="Optional completion note or deployment link..."
                    value={completionNote}
                    onChange={e => setCompletionNote(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#1a2234',
                      border: '1px solid #243048',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.8125rem',
                      marginBottom: '0.75rem'
                    }}
                  />
                  <button
                    onClick={() => handleMarkTaskComplete(selectedTask.id)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Completion
                  </button>
                </div>
              )}

              {/* Discussion Thread */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={14} /> Task Discussion Thread ({selectedTask.comments.length})
                </h4>
                <div style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  backgroundColor: '#1a2234',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}>
                  {selectedTask.comments.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>No messages yet.</span>
                  ) : (
                    selectedTask.comments.map(c => (
                      <div key={c.id} style={{ fontSize: '0.8rem' }}>
                        <strong style={{ color: c.user_role === 'admin' ? '#f59e0b' : '#3b82f6' }}>
                          {c.user_name} ({c.user_role}):
                        </strong>{' '}
                        <span>{c.message}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Post an update or question..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      backgroundColor: '#1a2234',
                      border: '1px solid #243048',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.8125rem'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 0.85rem',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
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

      {/* ==============================================
          MODAL: ADD EMPLOYEE (Auto-Generated Password)
          ============================================== */}
      {showAddEmpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f293d',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add New Employee</h2>
              <button
                onClick={() => setShowAddEmpModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {empCreatedNotice ? (
              <div>
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#6ee7b7',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  textAlign: 'center'
                }}>
                  <Check size={28} style={{ margin: '0 auto 0.5rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Employee Created!</h3>
                  <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    {empCreatedNotice.name} (@{empCreatedNotice.username})
                  </p>
                </div>

                <div style={{ backgroundColor: '#1a2234', border: '1px solid #243048', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                    Auto-Generated Password (One-Time Notice):
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      readOnly
                      value={empCreatedNotice.pass}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#111827',
                        border: '1px solid #243048',
                        borderRadius: '6px',
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                        fontWeight: 800
                      }}
                    />
                    <button
                      onClick={() => copyToClipboard(empCreatedNotice.pass)}
                      style={{
                        padding: '0.55rem 0.85rem',
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {copiedPass ? <Check size={14} /> : <Copy size={14} />}
                      {copiedPass ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.4rem' }}>
                    ⚠️ Provide this password to the employee. They will be forced to change it on their first login.
                  </span>
                </div>

                <button
                  onClick={() => setShowAddEmpModal(false)}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: '#1a2234', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateEmployeeSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpName}
                    onChange={e => setNewEmpName(e.target.value)}
                    placeholder="e.g. John Doe"
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Username *</label>
                  <input
                    type="text"
                    required
                    value={newEmpUsername}
                    onChange={e => {
                      setNewEmpUsername(e.target.value);
                      setGenPass(generatePassword(e.target.value));
                    }}
                    placeholder="e.g. johndoe"
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmpEmail}
                    onChange={e => setNewEmpEmail(e.target.value)}
                    placeholder="johndoe@vashik.com"
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Department</label>
                  <select
                    value={newEmpDept}
                    onChange={e => setNewEmpDept(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Architecture">Product Architecture</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Design & UI/UX">Design & UI/UX</option>
                  </select>
                </div>

                {/* Auto-Generated Password Preview */}
                <div style={{ backgroundColor: '#1a2234', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #243048' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Auto-Generated Password</span>
                    <button
                      type="button"
                      onClick={() => setGenPass(generatePassword(newEmpUsername || 'emp'))}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <RefreshCw size={11} /> Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={genPass}
                    style={{ width: '100%', padding: '0.45rem', backgroundColor: '#111827', border: '1px solid #243048', borderRadius: '4px', color: '#60a5fa', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                    Rule: username + 4 random digits + special character
                  </span>
                </div>

                <button
                  type="submit"
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create Employee Account
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==============================================
          MODAL: ASSIGN TASK
          ============================================== */}
      {showCreateTaskModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f293d',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Assign Deliverable</h2>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Assign To (By Username) *</label>
                <select
                  value={taskAssignee}
                  onChange={e => setTaskAssignee(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                >
                  {employeeUsers.map(emp => (
                    <option key={emp.id} value={emp.username}>
                      @{emp.username} — {emp.name} ({emp.points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Optimize Database Latency"
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description & Objectives *</label>
                <textarea
                  rows={3}
                  required
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Specific requirements, deliverables and acceptance benchmarks..."
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Deadline *</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskDeadline}
                    onChange={e => setTaskDeadline(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Resource Link</label>
                <input
                  type="url"
                  value={taskLinks[0] || ''}
                  onChange={e => setTaskLinks([e.target.value])}
                  placeholder="https://github.com/..."
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '0.7rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Assign Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================
          MODAL: MANUAL POINTS ADJUSTMENT
          ============================================== */}
      {pointsModal.open && pointsModal.user && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f293d',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '2rem'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Adjust Points: @{pointsModal.user.username}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              Current Points: <strong>{pointsModal.user.points} pts</strong> (Points never drop below 0).
            </p>

            <form onSubmit={handleSavePointsAdjustment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Points Change (+ or -)</label>
                <input
                  type="number"
                  required
                  value={pointsModal.amount}
                  onChange={e => setPointsModal(p => ({ ...p, amount: parseInt(e.target.value, 10) || 0 }))}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Reason for Adjustment *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Reason logged to points history ledger..."
                  value={pointsModal.reason}
                  onChange={e => setPointsModal(p => ({ ...p, reason: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setPointsModal({ open: false, user: null, amount: 10, reason: '' })}
                  style={{ padding: '0.6rem 1rem', backgroundColor: '#1a2234', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Alert Modal */}
      {resetPassAlert && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f293d',
            borderRadius: '16px',
            maxWidth: '420px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>Password Reset Notice</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              Temporary password for @{resetPassAlert.username}:
            </p>
            <div style={{
              backgroundColor: '#1a2234',
              padding: '0.75rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#60a5fa',
              marginBottom: '1.25rem'
            }}>
              {resetPassAlert.pass}
            </div>
            <button
              onClick={() => setResetPassAlert(null)}
              style={{ width: '100%', padding: '0.65rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done & Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Supabase Configuration Modal */}
      {showSupabaseModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f293d',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="#34d399" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Supabase Database Setup</h2>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#1a2234',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
              color: '#cbd5e1',
              lineHeight: 1.5
            }}>
              <strong style={{ color: '#34d399' }}>Quick 2-Step Supabase Setup:</strong>
              <ol style={{ marginLeft: '1.2rem', marginTop: '0.35rem' }}>
                <li>Run the provided script in <code>supabase/schema.sql</code> in your Supabase SQL Editor.</li>
                <li>Paste your <strong>Project URL</strong> and <strong>Anon Public Key</strong> below (or add them to <code>.env.local</code>).</li>
              </ol>
            </div>

            {supabaseStatusMsg && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#6ee7b7',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                {supabaseStatusMsg}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              localStorage.setItem('vashik_supabase_url', supabaseUrlInput.trim());
              localStorage.setItem('vashik_supabase_key', supabaseKeyInput.trim());
              setSupabaseConnected(true);
              setSupabaseStatusMsg('Connecting to Supabase...');
              const synced = await PortalStorage.syncFromSupabase();
              if (synced) {
                refreshAllData();
                setSupabaseStatusMsg('✓ Connected to Supabase! Live sync active.');
                setTimeout(() => setShowSupabaseModal(false), 1200);
              } else {
                setSupabaseStatusMsg('Could not fetch from Supabase. Please verify URL, Key, and that supabase/schema.sql has been executed.');
              }
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrlInput}
                  onChange={e => setSupabaseUrlInput(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Supabase Anon Public API Key
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={e => setSupabaseKeyInput(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1a2234', border: '1px solid #243048', borderRadius: '6px', color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('vashik_supabase_url');
                    localStorage.removeItem('vashik_supabase_key');
                    setSupabaseConnected(false);
                    setSupabaseStatusMsg('Switched back to local storage engine.');
                    refreshAllData();
                  }}
                  style={{ padding: '0.6rem 0.85rem', backgroundColor: '#1a2234', color: '#ef4444', border: '1px solid #243048', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Clear & Use Local
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowSupabaseModal(false)}
                    style={{ padding: '0.6rem 0.85rem', backgroundColor: '#1a2234', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '0.6rem 1.25rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Save & Connect
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
