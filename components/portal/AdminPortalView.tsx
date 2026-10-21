'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PortalUser,
  PortalTask,
  TaskPriority,
  TaskStatus,
  TaskAttachment,
  PointsHistoryEntry,
  NotificationItem,
  AuditLog,
  PortalStorage,
  generatePassword,
  PortalAnnouncement,
  AnnouncementCategory,
  AnnouncementButton
} from './PortalState';
import AdminAnnouncementsTab from './AdminAnnouncementsTab';
import AdminAnnouncementModal from './AdminAnnouncementModal';
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
  ExternalLink,
  MessageSquare,
  FileText,
  Send,
  Award,
  ChevronRight,
  ArrowLeft,
  X,
  Database,
  Calendar,
  Layers,
  Edit3,
  Sliders,
  Filter,
  ListTodo,
  Eye,
  EyeOff,
  Info,
  UserCheck,
  LayoutGrid,
  Table as TableIcon,
  Megaphone,
  Pin
} from 'lucide-react';

export default function AdminPortalView() {
  const [mounted, setMounted] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<PortalUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'tasks' | 'announcements' | 'leaderboard' | 'audit'>('overview');

  // Announcements State
  const [announcements, setAnnouncements] = useState<PortalAnnouncement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<PortalAnnouncement | null>(null);

  // Admin login form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data collections
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [tasks, setTasks] = useState<PortalTask[]>([]);
  const [history, setHistory] = useState<PointsHistoryEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Filters & Search
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('all');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'Pending' | 'Completed' | 'Overdue'>('all');
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState<string>('all');
  const [tasksViewMode, setTasksViewMode] = useState<'grid' | 'table'>('grid');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [auditLedgerSearch, setAuditLedgerSearch] = useState('');
  const [auditLogsSearch, setAuditLogsSearch] = useState('');
  const [assignEmpSearch, setAssignEmpSearch] = useState('');
  const [empModalTaskSearch, setEmpModalTaskSearch] = useState('');

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PortalTask | null>(null);
  const [selectedEmpForPoints, setSelectedEmpForPoints] = useState<PortalUser | null>(null);
  const [selectedEmpForPassReset, setSelectedEmpForPassReset] = useState<PortalUser | null>(null);
  const [selectedEmpForTasks, setSelectedEmpForTasks] = useState<PortalUser | null>(null);

  // Add Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpUsername, setNewEmpUsername] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [genPass, setGenPass] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);
  const [empCreatedNotice, setEmpCreatedNotice] = useState<{ name: string; username: string; pass: string; email: string } | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Points Adjustment Modal State
  const [pointsChangeAmount, setPointsChangeAmount] = useState<number>(10);
  const [pointsChangeType, setPointsChangeType] = useState<'add' | 'deduct'>('add');
  const [pointsChangeReason, setPointsChangeReason] = useState('');

  // Password Reset Modal State
  const [resetGenPass, setResetGenPass] = useState('');
  const [copiedResetPass, setCopiedResetPass] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  // Create Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState<number | ''>('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskLinkTitle, setTaskLinkTitle] = useState('');
  const [taskLinkUrl, setTaskLinkUrl] = useState('');
  const [taskLinks, setTaskLinks] = useState<{ title: string; url: string }[]>([]);
  const [taskDocName, setTaskDocName] = useState('');
  const [taskDocUrl, setTaskDocUrl] = useState('');

  // Task Discussion & Notes
  const [adminReplyComment, setAdminReplyComment] = useState('');

  // Task Reassignment state
  const [reassignTargetEmpId, setReassignTargetEmpId] = useState<number | ''>('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [assignLoadingStep, setAssignLoadingStep] = useState<string>('Creating deliverable & dispatching email...');

  // Supabase state
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const session = PortalStorage.getAdminSession();
    if (session && session.role === 'admin') {
      setCurrentAdmin(session);
    }
    refreshAllData();

    const isConfigured = isSupabaseConfigured();
    setSupabaseConnected(isConfigured);
    const cfg = getSupabaseConfig();
    setSupabaseUrlInput(cfg.url);
    setSupabaseKeyInput(cfg.anonKey);

    if (isConfigured) {
      PortalStorage.syncFromSupabase().then(success => {
        if (success) refreshAllData();
      });
    }

    // Subscribe to Realtime announcements & cross-tab sync
    const unsubAnnouncements = PortalStorage.subscribeToAnnouncements(items => {
      setAnnouncements(items);
    });

    // 1-minute automated overdue cron
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
    setAuditLogs(PortalStorage.getAuditLogs());
    setAnnouncements(PortalStorage.getAnnouncements());
    const sess = PortalStorage.getAdminSession();
    if (sess && sess.role === 'admin') {
      const allUsers = PortalStorage.getUsers();
      const updated = allUsers.find(
        u => sess.id && Number(u.id) === Number(sess.id)
      );
      if (updated && updated.role === 'admin') {
        setCurrentAdmin(updated);
        PortalStorage.setAdminSession(updated);
      } else {
        setCurrentAdmin(sess);
      }
    }
  };

  // Announcement Handlers
  const handleOpenCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setShowAnnouncementModal(true);
  };

  const handleOpenEditAnnouncement = (ann: PortalAnnouncement) => {
    setEditingAnnouncement(ann);
    setShowAnnouncementModal(true);
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this announcement?')) {
      await PortalStorage.deleteAnnouncement(id);
      setAnnouncements(PortalStorage.getAnnouncements());
    }
  };

  const handleTogglePinAnnouncement = async (id: number, currentPinned: boolean) => {
    await PortalStorage.updateAnnouncement(id, { is_pinned: !currentPinned });
    setAnnouncements(PortalStorage.getAnnouncements());
  };

  const handleSaveAnnouncement = async (data: {
    title: string;
    body: string;
    category: AnnouncementCategory;
    is_pinned: boolean;
    buttons: AnnouncementButton[];
  }) => {
    try {
      if (editingAnnouncement) {
        await PortalStorage.updateAnnouncement(editingAnnouncement.id, data);
      } else {
        const res = await PortalStorage.addAnnouncement({
          ...data,
          created_by_name: currentAdmin?.name || 'Vashik Admin'
        });
        if (res && res.error) {
          alert(`Notice: Announcement was saved locally, but Supabase returned a policy restriction:\n"${res.error}"\n\nPlease apply the Row Level Security (RLS) policy in your Supabase SQL editor.`);
        }
      }
      setAnnouncements(PortalStorage.getAnnouncements());
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
    } catch (err: any) {
      alert(`Error saving announcement: ${err?.message || err}`);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const entered = adminUsername.trim().toLowerCase();
    const enteredPass = adminPassword.trim();

    const employeeAccount = users.find(
      u => (u.username.toLowerCase() === entered || u.email.toLowerCase() === entered) && u.role === 'employee'
    );

    if (employeeAccount) {
      setLoginError('Access denied: This URL is reserved for Administrators only. Employees must use /portal.');
      return;
    }

    // Find admin user or fallback to standard admin credentials
    let admin = users.find(
      u => (u.username.toLowerCase() === entered || u.email.toLowerCase() === entered || (['vashik_admin', 'admin'].includes(entered) && u.role === 'admin')) && u.role === 'admin'
    );

    if (!admin && (entered === 'vashik_admin' || entered === 'admin' || entered === 'admin@vashik.com')) {
      admin = {
        id: 1,
        name: 'System Administrator',
        username: 'vashik_admin',
        email: 'admin@vashik.com',
        role: 'admin',
        department: 'Management',
        points: 100,
        is_active: true,
        must_change_password: false,
        password_plain: 'Admin@2026!',
        created_at: new Date().toISOString()
      };
      PortalStorage.setUsers([admin, ...users.filter(u => u.role !== 'admin')]);
    }

    if (!admin) {
      setLoginError('Invalid administrator credentials.');
      return;
    }

    const validPasswords = ['Admin@2026!', 'AdminPassword123!', admin.password_plain].filter(Boolean);
    if (!validPasswords.includes(enteredPass)) {
      setLoginError('Incorrect password for administrator.');
      return;
    }

    PortalStorage.setAdminSession(admin);
    PortalStorage.setSessionUser(admin);
    setCurrentAdmin(admin);
    PortalStorage.logAudit('ADMIN_LOGIN', `Administrator @${admin.username} authenticated.`);
  };

  const handleAdminLogout = () => {
    PortalStorage.setAdminSession(null);
    PortalStorage.setSessionUser(null);
    setCurrentAdmin(null);
    setActiveTab('overview');
  };

  // Add Employee
  const handleOpenAddEmployee = () => {
    const defaultUser = `emp_${Math.floor(100 + Math.random() * 900)}`;
    setNewEmpName('');
    setNewEmpUsername(defaultUser);
    setNewEmpEmail(`${defaultUser}@vashik.com`);
    setNewEmpDept('Engineering');
    setNewEmpPhone('+1-555-' + Math.floor(1000 + Math.random() * 9000));
    const pass = generatePassword(defaultUser);
    setGenPass(pass);
    setCopiedPass(false);
    setShowAddEmpModal(true);
  };

  const handleRegeneratePassword = () => {
    const pass = generatePassword(newEmpUsername || 'emp');
    setGenPass(pass);
    setCopiedPass(false);
  };

  const handleCopyPassword = () => {
    if (!genPass) return;
    navigator.clipboard.writeText(genPass);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  const handleSubmitAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newEmpUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUser) return;

    const currentUsers = PortalStorage.getUsers();
    if (currentUsers.some(u => u.username.toLowerCase() === cleanUser)) {
      alert(`The username @${cleanUser} is already in use by another employee account. Each employee must have a unique username (for example, @${cleanUser}_1 or @${cleanUser}_dev) so their deliverables and logins remain completely separate.`);
      return;
    }

    const rawEmail = newEmpEmail.trim() || `${cleanUser}@vashik.com`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(rawEmail)) {
      alert(`Invalid email address format: "${rawEmail}". Please ensure you include a valid domain extension like .com (e.g. name@gmail.com).`);
      return;
    }

    if (currentUsers.some(u => u.email.toLowerCase() === rawEmail.toLowerCase())) {
      alert(`An account with email "${rawEmail}" already exists. Each employee must have a unique email address.`);
      return;
    }

    const newUser: PortalUser = {
      id: Date.now(),
      name: newEmpName.trim() || 'New Employee',
      username: cleanUser,
      email: rawEmail,
      role: 'employee',
      department: newEmpDept,
      phone: newEmpPhone.trim() || undefined,
      points: 100, // mandatory 100 starting points
      is_active: true,
      must_change_password: true, // forced password change on first login
      password_plain: genPass,
      created_at: new Date().toISOString()
    };

    // Sync to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: dbUser, error: dbErr } = await supabase.from('users').insert([{
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          role: 'employee',
          department: newUser.department,
          phone: newUser.phone,
          points: 100,
          is_active: true,
          must_change_password: true,
          password_hash: genPass,
          password_plain: genPass
        }]).select().single();

        if (dbErr) {
          console.error('Supabase employee insertion error:', dbErr);
          alert(`Supabase Error: ${dbErr.message}`);
          return;
        }

        if (dbUser) {
          newUser.id = dbUser.id;
          await supabase.from('points_history').insert([{
            user_id: dbUser.id,
            change: 100,
            balance_after: 100,
            reason: 'Initial starting credit on account creation'
          }]);
        }
      } catch (err) {
        console.error('Failed to insert employee into Supabase:', err);
      }
    }

    const updatedUsers = [...users.filter(u => u.username !== newUser.username), newUser];
    PortalStorage.setUsers(updatedUsers);

    // Initial starting points ledger entry
    const allHistory = PortalStorage.getHistory();
    allHistory.unshift({
      id: Date.now(),
      user_id: newUser.id,
      change: 100,
      balance_after: 100,
      reason: 'Initial starting credit on account creation',
      created_at: new Date().toISOString()
    });
    PortalStorage.setHistory(allHistory);

    PortalStorage.logAudit(
      'EMPLOYEE_CREATED',
      `Created employee @${newUser.username} (${newUser.name}) in ${newUser.department}. Initial 100 pts credited.`
    );

    setShowAddEmpModal(false);
    refreshAllData();

    // Trigger automated welcome notification email via Brevo API
    try {
      fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: newUser.name,
          employeeEmail: newUser.email,
          username: newUser.username,
          tempPassword: genPass,
          loginUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://vashik.in/protal'
        })
      }).catch(err => {
        console.warn('[Brevo Welcome Email Notification] Non-blocking dispatch notice:', err);
      });
    } catch (e) {
      // Non-blocking containment
    }

    // Show reveal modal
    setEmpCreatedNotice({
      name: newUser.name,
      username: newUser.username,
      pass: genPass,
      email: newUser.email
    });
  };

  const handleCopyCredentialsSummary = () => {
    if (!empCreatedNotice) return;
    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://vashik.in/protal';
    const text = `VASHIK Employee Portal Access Credentials:\nURL: ${portalUrl}\nUsername: ${empCreatedNotice.username}\nEmail: ${empCreatedNotice.email}\nTemporary Password: ${empCreatedNotice.pass}\nNote: You will be asked to choose a new password upon first sign-in.`;
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  // Toggle Deactivate / Activate
  const handleToggleActive = (user: PortalUser) => {
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, is_active: !u.is_active };
      }
      return u;
    });
    PortalStorage.setUsers(updatedUsers);
    PortalStorage.logAudit('USER_STATUS_CHANGE', `${user.is_active ? 'Deactivated' : 'Reactivated'} employee @${user.username}.`);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('users').update({ is_active: !user.is_active }).eq('id', user.id).then();
    }
    refreshAllData();
  };

  // Delete Employee
  const handleDeleteUser = (user: PortalUser) => {
    if (!confirm(`Are you sure you want to permanently delete employee @${user.username}?`)) return;
    const updatedUsers = users.filter(u => u.id !== user.id);
    PortalStorage.setUsers(updatedUsers);
    PortalStorage.logAudit('USER_DELETED', `Deleted employee @${user.username} (${user.name}).`);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('users').delete().eq('id', user.id).then();
    }
    refreshAllData();
  };

  // Password Reset for Employee
  const handleOpenResetPassword = (emp: PortalUser) => {
    setSelectedEmpForPassReset(emp);
    const newP = generatePassword(emp.username);
    setResetGenPass(newP);
    setCopiedResetPass(false);
    setResetSuccessNotice(null);
  };

  const handleConfirmPasswordReset = () => {
    if (!selectedEmpForPassReset || !resetGenPass) return;
    const updatedUsers = users.map(u => {
      if (u.id === selectedEmpForPassReset.id) {
        return { ...u, password_plain: resetGenPass, must_change_password: true };
      }
      return u;
    });
    PortalStorage.setUsers(updatedUsers);
    PortalStorage.logAudit('PASSWORD_RESET_ADMIN', `Reset password for employee @${selectedEmpForPassReset.username}. Forced password change flagged.`);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('users').update({
        password_plain: resetGenPass,
        password_hash: resetGenPass,
        must_change_password: true
      }).eq('id', selectedEmpForPassReset.id).then();
    }
    refreshAllData();
    setResetSuccessNotice(`Password updated for @${selectedEmpForPassReset.username}!`);
  };

  // Manual Points Adjustment
  const handleOpenPointsModal = (emp: PortalUser) => {
    setSelectedEmpForPoints(emp);
    setPointsChangeAmount(10);
    setPointsChangeType('add');
    setPointsChangeReason('');
  };

  const handleConfirmPointsAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForPoints) return;
    const delta = pointsChangeType === 'add' ? Math.abs(pointsChangeAmount) : -Math.abs(pointsChangeAmount);
    const newTotal = Math.max(0, selectedEmpForPoints.points + delta); // minimum 0 floor
    const effectiveDelta = newTotal - selectedEmpForPoints.points;

    const updatedUsers = users.map(u => {
      if (u.id === selectedEmpForPoints.id) {
        return { ...u, points: newTotal };
      }
      return u;
    });
    PortalStorage.setUsers(updatedUsers);

    const allHistory = PortalStorage.getHistory();
    allHistory.unshift({
      id: Date.now(),
      user_id: selectedEmpForPoints.id,
      change: effectiveDelta,
      balance_after: newTotal,
      reason: pointsChangeReason.trim() || `Admin manual adjustment (${effectiveDelta >= 0 ? '+' : ''}${effectiveDelta} pts)`,
      created_at: new Date().toISOString()
    });
    PortalStorage.setHistory(allHistory);

    PortalStorage.logAudit(
      'POINTS_ADJUSTED_MANUAL',
      `Admin adjusted @${selectedEmpForPoints.username} points by ${effectiveDelta >= 0 ? '+' : ''}${effectiveDelta} pts. Balance: ${newTotal}. Reason: ${pointsChangeReason}`
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('users').update({ points: newTotal }).eq('id', selectedEmpForPoints.id).then();
      supabase.from('points_history').insert([{
        user_id: selectedEmpForPoints.id,
        change: effectiveDelta,
        balance_after: newTotal,
        reason: pointsChangeReason.trim() || `Admin manual adjustment`
      }]).then();
    }

    refreshAllData();
    setSelectedEmpForPoints(null);
  };

  // Create Task
  const handleOpenCreateTask = () => {
    setTaskTitle('');
    setTaskDesc('');
    const firstEmp = users.find(u => u.role === 'employee');
    setTaskAssignee(firstEmp ? firstEmp.id : '');
    setTaskPriority('Medium');
    // Default deadline: 3 days from now
    const d = new Date(Date.now() + 3 * 86400000);
    const isoString = d.toISOString().slice(0, 16);
    setTaskDeadline(isoString);
    setTaskLinks([]);
    setTaskLinkTitle('');
    setTaskLinkUrl('');
    setTaskDocName('');
    setTaskDocUrl('');
    setShowCreateTaskModal(true);
  };

  const handleAddLinkToTask = () => {
    if (!taskLinkUrl.trim()) return;
    setTaskLinks([...taskLinks, {
      title: taskLinkTitle.trim() || taskLinkUrl.trim(),
      url: taskLinkUrl.trim().startsWith('http') ? taskLinkUrl.trim() : `https://${taskLinkUrl.trim()}`
    }]);
    setTaskLinkTitle('');
    setTaskLinkUrl('');
  };

  const handleRemoveTaskLink = (idx: number) => {
    setTaskLinks(taskLinks.filter((_, i) => i !== idx));
  };

  const handleSubmitCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskAssignee || !taskDeadline) return;

    const assigneeObj = users.find(u => u.id === Number(taskAssignee));
    if (!assigneeObj) return;

    setIsAssigningTask(true);
    setAssignLoadingStep(`Saving deliverable and preparing email notification for ${assigneeObj.name}...`);

    const attachmentsList: TaskAttachment[] = [];
    taskLinks.forEach((l, idx) => {
      attachmentsList.push({
        id: Date.now() + idx,
        task_id: 0,
        type: 'link',
        url_or_path: l.url,
        original_name: l.title,
        created_at: new Date().toISOString()
      });
    });

    if (taskDocName.trim() || taskDocUrl.trim()) {
      attachmentsList.push({
        id: Date.now() + 99,
        task_id: 0,
        type: 'file',
        url_or_path: taskDocUrl.trim() || '#',
        original_name: taskDocName.trim() || 'Specification-Brief.pdf',
        created_at: new Date().toISOString()
      });
    }

    const newTask: PortalTask = {
      id: Date.now(),
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      assigned_to: assigneeObj.id,
      assigned_to_name: assigneeObj.name,
      assigned_to_username: assigneeObj.username,
      created_by: currentAdmin?.id,
      deadline: new Date(taskDeadline).toISOString(),
      priority: taskPriority,
      status: 'Pending',
      points_deducted: false,
      points_bonus_awarded: false,
      is_recurring: false,
      attachments: attachmentsList,
      comments: [],
      created_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: dbTask, error: tErr } = await supabase.from('tasks').insert([{
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assigned_to,
          created_by: newTask.created_by,
          deadline: newTask.deadline,
          priority: newTask.priority,
          status: 'Pending',
          points_deducted: false,
          points_bonus_awarded: false,
          is_recurring: false
        }]).select().single();

        if (tErr) {
          console.error('Supabase task creation error:', tErr);
          alert(`Supabase Task Error: ${tErr.message}`);
          setIsAssigningTask(false);
          return;
        }

        if (dbTask) {
          newTask.id = dbTask.id;
          if (attachmentsList.length > 0) {
            const { data: dbAtts } = await supabase.from('task_attachments').insert(
              attachmentsList.map(a => ({
                task_id: dbTask.id,
                type: a.type,
                url_or_path: a.url_or_path,
                original_name: a.original_name
              }))
            ).select();
            if (dbAtts) {
              newTask.attachments = dbAtts;
            }
          }
        }
      } catch (err) {
        console.error('Failed to save task to Supabase:', err);
      }
    }

    const allTasks = PortalStorage.getTasks();
    allTasks.unshift(newTask);
    PortalStorage.setTasks(allTasks);

    // Notification to employee
    const notifs = PortalStorage.getNotifications();
    notifs.unshift({
      id: Date.now(),
      user_id: assigneeObj.id,
      type: 'task_assigned',
      message: `New deliverable assigned: "${newTask.title}" (Priority: ${newTask.priority}). Deadline: ${new Date(newTask.deadline).toLocaleDateString()}`,
      task_id: newTask.id,
      is_read: false,
      created_at: new Date().toISOString()
    });
    PortalStorage.setNotifications(notifs);

    PortalStorage.logAudit('TASK_CREATED', `Deliverable #${newTask.id} assigned to @${assigneeObj.username}.`);

    // Trigger automated task assignment email notification via Brevo API
    setAssignLoadingStep(`Sending assignment email notification to ${assigneeObj.email}...`);
    try {
      const emailRes = await fetch('/api/email/task-assigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: assigneeObj.name,
          employeeEmail: assigneeObj.email,
          taskTitle: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.deadline,
          assignedBy: currentAdmin?.name || 'Administrator',
          taskUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://vashik.in/protal',
          isReassignment: false
        })
      });
      const data = await emailRes.json().catch(() => null);
      if (data?.success) {
        setAssignLoadingStep(`✓ Email successfully delivered to ${assigneeObj.email}!`);
      } else {
        setAssignLoadingStep(`✓ Deliverable assigned to @${assigneeObj.username}!`);
      }
    } catch (e) {
      setAssignLoadingStep(`✓ Deliverable assigned to @${assigneeObj.username}!`);
    }

    // Brief smooth delay so the admin sees the confirmation before modal closes
    await new Promise(r => setTimeout(r, 650));
    setIsAssigningTask(false);
    setShowCreateTaskModal(false);

    // Reset form fields
    setTaskTitle('');
    setTaskDesc('');
    setTaskAssignee('');
    setTaskPriority('Medium');
    setTaskDeadline('');
    setTaskLinks([]);
    setTaskDocName('');
    setTaskDocUrl('');
    refreshAllData();
  };

  // Reassign Task to another employee
  const handleReassignTask = (task: PortalTask, newAssigneeId: number) => {
    // Prevent duplicate emails and redundant updates if assignee did not change
    if (!newAssigneeId || Number(newAssigneeId) === Number(task.assigned_to)) {
      return;
    }

    const newAssigneeObj = users.find(u => Number(u.id) === Number(newAssigneeId));
    if (!newAssigneeObj) return;

    const oldAssigneeName = task.assigned_to_name;
    const oldAssigneeUsername = task.assigned_to_username;

    const allTasks = PortalStorage.getTasks();
    const taskIdx = allTasks.findIndex(t => t.id === task.id);
    if (taskIdx === -1) return;

    const updatedTask: PortalTask = {
      ...allTasks[taskIdx],
      assigned_to: newAssigneeObj.id,
      assigned_to_name: newAssigneeObj.name,
      assigned_to_username: newAssigneeObj.username
    };

    allTasks[taskIdx] = updatedTask;
    PortalStorage.setTasks(allTasks);

    // Sync to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('tasks').update({
        assigned_to: newAssigneeObj.id
      }).eq('id', task.id).then();
    }

    // Add in-app notification to new assignee
    const notifs = PortalStorage.getNotifications();
    notifs.unshift({
      id: Date.now(),
      user_id: newAssigneeObj.id,
      type: 'task_assigned',
      message: `Deliverable reassigned to you: "${task.title}" (Priority: ${task.priority}). Deadline: ${new Date(task.deadline).toLocaleDateString()}`,
      task_id: task.id,
      is_read: false,
      created_at: new Date().toISOString()
    });
    PortalStorage.setNotifications(notifs);

    // Audit log
    PortalStorage.logAudit(
      'TASK_REASSIGNED',
      `Deliverable #${task.id} ("${task.title}") reassigned from @${oldAssigneeUsername} (${oldAssigneeName}) to @${newAssigneeObj.username} (${newAssigneeObj.name}).`
    );

    // Trigger automated email notification via Brevo to the new assignee
    try {
      fetch('/api/email/task-assigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: newAssigneeObj.name,
          employeeEmail: newAssigneeObj.email,
          taskTitle: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.deadline,
          assignedBy: currentAdmin?.name || 'Administrator',
          taskUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://vashik.in/protal',
          isReassignment: true
        })
      }).catch(err => {
        console.warn('[Brevo Task Reassignment Email] Non-blocking dispatch notice:', err);
      });
    } catch (e) {
      // Non-blocking containment
    }

    setSelectedTask(updatedTask);
    setIsReassigning(false);
    setReassignTargetEmpId('');
    refreshAllData();
  };

  // Delete Task
  const handleDeleteTask = (task: PortalTask) => {
    if (!confirm(`Delete deliverable "${task.title}"?`)) return;
    const allTasks = PortalStorage.getTasks().filter(t => t.id !== task.id);
    PortalStorage.setTasks(allTasks);
    PortalStorage.logAudit('TASK_DELETED', `Deleted deliverable #${task.id} ("${task.title}").`);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('tasks').delete().eq('id', task.id).then();
    }

    if (selectedTask?.id === task.id) setSelectedTask(null);
    refreshAllData();
  };

  // Post Comment as Admin
  const handleAdminComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !adminReplyComment.trim() || !currentAdmin) return;

    const allTasks = PortalStorage.getTasks();
    const taskObj = allTasks.find(t => t.id === selectedTask.id);
    if (!taskObj) return;

    const comment = {
      id: Date.now(),
      task_id: taskObj.id,
      user_id: currentAdmin.id,
      user_name: currentAdmin.name,
      user_role: 'admin' as const,
      message: adminReplyComment.trim(),
      created_at: new Date().toISOString()
    };

    taskObj.comments.push(comment);
    PortalStorage.setTasks(allTasks);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('comments').insert([{
        task_id: taskObj.id,
        user_id: currentAdmin.id,
        message: adminReplyComment.trim()
      }]).then();
    }

    // Notify employee
    const notifs = PortalStorage.getNotifications();
    notifs.unshift({
      id: Date.now(),
      user_id: taskObj.assigned_to,
      type: 'task_assigned',
      message: `Admin commented on "${taskObj.title}": "${adminReplyComment.slice(0, 50)}..."`,
      task_id: taskObj.id,
      is_read: false,
      created_at: new Date().toISOString()
    });
    PortalStorage.setNotifications(notifs);

    setAdminReplyComment('');
    setSelectedTask({ ...taskObj });
    refreshAllData();
  };

  // Export CSV
  const handleExportCSV = () => {
    const employees = users.filter(u => u.role === 'employee');
    const rows = [
      ['ID', 'Name', 'Username', 'Email', 'Department', 'Phone', 'Points', 'Status', 'Completed Tasks', 'Overdue Tasks'],
      ...employees.map(u => {
        const empTasks = tasks.filter(t => t.assigned_to === u.id);
        const comp = empTasks.filter(t => t.status === 'Completed').length;
        const over = empTasks.filter(t => t.status === 'Overdue').length;
        return [
          u.id,
          `"${u.name}"`,
          u.username,
          u.email,
          `"${u.department}"`,
          u.phone || '',
          u.points,
          u.is_active ? 'Active' : 'Deactivated',
          comp,
          over
        ];
      })
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VASHIK_Personnel_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Countdown string
  const getCountdownString = (deadline: string, status: TaskStatus) => {
    if (status === 'Completed') return '✓ Completed';
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      const hours = Math.floor(absDiff / 3600000);
      const mins = Math.floor((absDiff % 3600000) / 60000);
      return `⚠️ Overdue by ${hours}h ${mins}m`;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m remaining`;
  };

  // Full formatted date and time for complete assignment info
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

  // Relative humanized time helper
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

  const employeeUsers = users.filter(u => u.role === 'employee');
  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const overdueTasksCount = tasks.filter(t => t.status === 'Overdue').length;
  const avgPoints = employeeUsers.length
    ? Math.round(employeeUsers.reduce((acc, u) => acc + u.points, 0) / employeeUsers.length)
    : 100;

  const filteredEmployees = employeeUsers.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(empSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(empSearch.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(empSearch.toLowerCase()));
    const matchesDept = empDeptFilter === 'all' || u.department === empDeptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredTasks = tasks.filter(t => {
    const q = taskSearch.toLowerCase().trim();
    const assignedEmp = users.find(u => Number(u.id) === Number(t.assigned_to));
    const matchesSearch = !q ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.assigned_to_name.toLowerCase().includes(q) ||
      t.assigned_to_username.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      (assignedEmp?.department && assignedEmp.department.toLowerCase().includes(q));
    const matchesStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;
    const matchesAssignee = taskAssigneeFilter === 'all' ||
      Number(t.assigned_to) === Number(taskAssigneeFilter);
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const sortedLeaderboard = [...employeeUsers].sort((a, b) => b.points - a.points);
  const filteredLeaderboard = sortedLeaderboard.filter(emp => {
    if (!leaderboardSearch.trim()) return true;
    const q = leaderboardSearch.toLowerCase().trim();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.username.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    );
  });

  const filteredHistory = history.filter(entry => {
    if (!auditLedgerSearch.trim()) return true;
    const q = auditLedgerSearch.toLowerCase().trim();
    const emp = users.find(u => u.id === entry.user_id);
    return (
      (emp && (emp.name.toLowerCase().includes(q) || emp.username.toLowerCase().includes(q))) ||
      entry.reason.toLowerCase().includes(q) ||
      (entry.task_title && entry.task_title.toLowerCase().includes(q))
    );
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    if (!auditLogsSearch.trim()) return true;
    const q = auditLogsSearch.toLowerCase().trim();
    return log.action.toLowerCase().includes(q) || log.details.toLowerCase().includes(q);
  });

  const departmentsList = Array.from(new Set(employeeUsers.map(u => u.department)));

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

  // ====================================================
  // VIEW 1: DEDICATED ADMIN LOGIN (Vashik Minimalist White/Slate)
  // ====================================================
  if (!currentAdmin) {
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
        {/* Navigation link to website */}
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

        {/* Admin Card */}
        <div style={{
          maxWidth: '450px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Image
              src="/logo.png"
              alt="VASHIK Logo"
              width={48}
              height={48}
              style={{ objectFit: 'contain', margin: '0 auto 1rem' }}
              priority
            />
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              marginBottom: '0.5rem'
            }}>
              <ShieldCheck size={14} color="#0f172a" />
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#0f172a'
              }}>
                Restricted Administration Suite
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', marginTop: '0.2rem' }}>
              Administrator Login
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Secure personnel roster, task assignments, and points management.
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

          <form onSubmit={handleAdminLogin} suppressHydrationWarning>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1e293b' }}>
                Admin Username or Email
              </label>
              <input
                type="text"
                required
                suppressHydrationWarning
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                placeholder="vashik_admin"
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
                Admin Security Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  suppressHydrationWarning
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.6rem 0.65rem 0.875rem',
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
                  onClick={() => setShowAdminPassword(prev => !prev)}
                  title={showAdminPassword ? 'Hide password' : 'View password'}
                  aria-label={showAdminPassword ? 'Hide password' : 'View password'}
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
                    justifyContent: 'center',
                    padding: '0.2rem'
                  }}
                >
                  {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
              Authenticate as Administrator
              <ArrowRight size={16} />
            </button>

            <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setAdminUsername('vashik_admin');
                  setAdminPassword('Admin@2026!');
                  const adminUser = users.find(u => u.role === 'admin') || {
                    id: 1,
                    name: 'System Administrator',
                    username: 'vashik_admin',
                    email: 'admin@vashik.com',
                    role: 'admin',
                    department: 'Management',
                    points: 100,
                    is_active: true,
                    must_change_password: false,
                    password_plain: 'Admin@2026!',
                    created_at: new Date().toISOString()
                  };
                  setCurrentAdmin(adminUser as any);
                  PortalStorage.setAdminSession(adminUser as any);
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  border: '1.5px dashed #bfdbfe',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  transition: 'background-color 0.15s'
                }}
              >
                <ShieldCheck size={15} color="#2563eb" />
                <span>1-Click Admin Login (Demo / Admin Access)</span>
              </button>
            </div>
          </form>

          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#64748b'
          }}>
            VASHIK TECHNOLOGY • Dedicated Administrative Access Only
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // VIEW 2: AUTHENTICATED ADMIN CONSOLE
  // ====================================================
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafbfc',
      color: '#0f172a',
      fontFamily: 'var(--font-primary), -apple-system, sans-serif'
    }}>
      {/* Top Navbar */}
      <header className="vashik-admin-header" style={{
        height: '72px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Row 1 on mobile / Left group on desktop */}
        <div className="vashik-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <Image src="/logo.png" alt="VASHIK Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                VASHIK
              </span>
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#0f172a'
            }}>
              <ShieldCheck size={13} color="#0f172a" />
              Admin
            </div>
          </div>

          {/* Admin User Chip & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>{currentAdmin.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>@{currentAdmin.username}</div>
            </div>
            <button
              onClick={handleAdminLogout}
              title="Sign Out"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="vashik-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Supabase Status Pill */}
          <button
            onClick={() => setShowSupabaseModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: supabaseConnected ? '#ecfdf5' : '#f8fafc',
              border: `1px solid ${supabaseConnected ? '#a7f3d0' : '#e2e8f0'}`,
              color: supabaseConnected ? '#065f46' : '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Database size={13} />
            <span>{supabaseConnected ? 'Supabase Live' : 'Cloud DB'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {/* Quick Create Announcement */}
          <button
            onClick={handleOpenCreateAnnouncement}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1.05rem',
              borderRadius: '9999px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Megaphone size={14} />
            <span>+ Add Announcement</span>
          </button>

          {/* Quick Create Deliverable */}
          <button
            onClick={handleOpenCreateTask}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15,23,42,0.1)'
            }}
          >
            <PlusCircle size={14} />
            <span>Assign Task</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Navigation Tabs */}
        <div className="vashik-tabs-nav" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: Activity },
            { id: 'employees', label: `Personnel Directory (${employeeUsers.length})`, icon: Users },
            { id: 'tasks', label: `Deliverables & Timers (${tasks.length})`, icon: Clock },
            { id: 'announcements', label: `Announcements (${announcements.length})`, icon: Megaphone },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'audit', label: 'Audit & Points Ledger', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? '#0f172a' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: `1px solid ${isActive ? '#0f172a' : '#e2e8f0'}`,
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & KPIS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards Grid */}
            <div className="vashik-grid-kpi" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Active Employees
                  </span>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} color="#0f172a" />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {employeeUsers.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>
                  ✓ All personnel seeded with 100 base pts
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Pending Deliverables
                  </span>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={16} color="#2563eb" />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {pendingTasksCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Active countdown timers running
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Overdue Deliverables
                  </span>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={16} color="#dc2626" />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: overdueTasksCount > 0 ? '#dc2626' : '#0f172a', lineHeight: 1 }}>
                  {overdueTasksCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontWeight: 600 }}>
                  -10 pts auto-deduction active every min
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Average Points
                  </span>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={16} color="#16a34a" />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {avgPoints}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: 600 }}>
                  +5 on-time bonus enabled
                </div>
              </div>

              {/* Announcements KPI Card */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
                      Announcements
                    </span>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Megaphone size={16} color="#2563eb" />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {announcements.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.5rem', fontWeight: 600 }}>
                    {announcements.filter(a => a.is_pinned).length} pinned notices • Live on feed
                  </div>
                </div>
                <button
                  onClick={handleOpenCreateAnnouncement}
                  style={{
                    marginTop: '0.85rem',
                    padding: '0.45rem 0.95rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    width: 'fit-content',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <Megaphone size={13} />
                  <span>+ Add Announcement</span>
                </button>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Quick Actions Card */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Administrative Quick Actions
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Execute core organizational workflows directly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Option 1: Publish Announcement */}
                  <button
                    onClick={handleOpenCreateAnnouncement}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      backgroundColor: '#eff6ff',
                      border: '1.5px solid #bfdbfe',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Megaphone size={16} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e40af' }}>Publish New Announcement</div>
                        <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Post title, body text & dynamic action buttons (links)</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#2563eb" />
                  </button>

                  <button
                    onClick={handleOpenAddEmployee}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={16} color="#0f172a" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Add New Employee</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>With auto-password generator & one-time reveal</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </button>

                  <button
                    onClick={handleOpenCreateTask}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlusCircle size={16} color="#0f172a" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Assign Deliverable</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Set deadline, priority, attachments & links</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </button>

                  <button
                    onClick={handleExportCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Download size={16} color="#0f172a" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Download Personnel CSV</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Full report with points, completed & overdue stats</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </button>
                </div>
              </div>

              {/* Recent Audit Activity */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Live Audit Activity
                  </h3>
                  <button
                    onClick={() => setActiveTab('audit')}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    View Full Ledger →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {auditLogs.slice(0, 6).map(log => (
                    <div key={log.id} style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      fontSize: '0.78rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.action}</span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ color: '#475569' }}>{log.details}</div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      No recent activity recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: EMPLOYEE ROSTER & MANAGEMENT */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'employees' && (
          <div>
            {/* Header with Search and Add Employee */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
                <div style={{
                  position: 'relative',
                  flex: 1,
                  maxWidth: '380px'
                }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={empSearch}
                    onChange={e => setEmpSearch(e.target.value)}
                    placeholder="Search by name, @username, or email..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                </div>

                <select
                  value={empDeptFilter}
                  onChange={e => setEmpDeptFilter(e.target.value)}
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Departments</option>
                  {departmentsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenAddEmployee}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '9999px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.1)'
                }}
              >
                <UserPlus size={15} />
                <span>Add New Employee</span>
              </button>
            </div>

            {/* Employees Table */}
            <div className="vashik-table-wrap" style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflowX: 'auto',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deliverables</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => {
                    const empTasks = tasks.filter(t => 
                      Number(t.assigned_to) === Number(emp.id)
                    );
                    const completedCount = empTasks.filter(t => t.status === 'Completed').length;
                    const pendingCount = empTasks.filter(t => t.status === 'Pending').length;
                    const overdueCount = empTasks.filter(t => t.status === 'Overdue').length;

                    return (
                      <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}>
                              {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{emp.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {emp.department}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ color: '#0f172a', fontSize: '0.8125rem' }}>{emp.email}</div>
                          {emp.phone && <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{emp.phone}</div>}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor: emp.points >= 100 ? '#f0fdf4' : '#fef2f2',
                            color: emp.points >= 100 ? '#15803d' : '#b91c1c',
                            fontWeight: 700,
                            fontSize: '0.8125rem'
                          }}>
                            <Zap size={13} />
                            <span>{emp.points} pts</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <button
                            onClick={() => setSelectedEmpForTasks(emp)}
                            title={`Click to view all ${empTasks.length} assigned deliverables for ${emp.name}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '8px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <ListTodo size={14} color="#2563eb" />
                            <span>View Tasks ({empTasks.length})</span>
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                            <span style={{ color: '#2563eb', fontWeight: 600 }}>{pendingCount} active</span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ color: '#16a34a', fontWeight: 600 }}>{completedCount} done</span>
                            {overdueCount > 0 && (
                              <>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>{overdueCount} overdue</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            backgroundColor: emp.is_active ? '#ecfdf5' : '#f1f5f9',
                            color: emp.is_active ? '#047857' : '#64748b',
                            fontSize: '0.72rem',
                            fontWeight: 600
                          }}>
                            {emp.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={() => setSelectedEmpForTasks(emp)}
                              title={`View all assigned tasks for ${emp.name}`}
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <FileText size={12} />
                              <span>Tasks</span>
                            </button>

                            <button
                              onClick={() => handleOpenPointsModal(emp)}
                              title="Adjust Points"
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                color: '#0f172a',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              +/- Points
                            </button>

                            <button
                              onClick={() => handleOpenResetPassword(emp)}
                              title="Reset Password"
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                color: '#475569',
                                cursor: 'pointer'
                              }}
                            >
                              <KeyRound size={13} />
                            </button>

                            <button
                              onClick={() => handleToggleActive(emp)}
                              title={emp.is_active ? 'Deactivate Employee' : 'Activate Employee'}
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                backgroundColor: emp.is_active ? '#fef2f2' : '#f0fdf4',
                                border: '1px solid #e2e8f0',
                                color: emp.is_active ? '#dc2626' : '#16a34a',
                                cursor: 'pointer'
                              }}
                            >
                              <Sliders size={13} />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(emp)}
                              title="Delete Employee"
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #fee2e2',
                                color: '#dc2626',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        No employees found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: DELIVERABLES & TASK TIMERS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'tasks' && (
          <div>
            {/* Header with Search and Assign Deliverable */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
                <div style={{
                  position: 'relative',
                  flex: 1,
                  minWidth: '240px',
                  maxWidth: '380px'
                }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={e => setTaskSearch(e.target.value)}
                    placeholder="Search tasks by title, scope, person, dept..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 2rem 0.55rem 2.25rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      color: '#0f172a'
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
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: '#f1f5f9', padding: '0.2rem', borderRadius: '9999px' }}>
                  {(['all', 'Pending', 'Completed', 'Overdue'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setTaskStatusFilter(st)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '9999px',
                        border: 'none',
                        backgroundColor: taskStatusFilter === st ? '#ffffff' : 'transparent',
                        color: taskStatusFilter === st ? '#0f172a' : '#64748b',
                        fontWeight: taskStatusFilter === st ? 700 : 500,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        boxShadow: taskStatusFilter === st ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      {st === 'all' ? 'All' : st}
                    </button>
                  ))}
                </div>

                {/* Employee Assignee Dropdown Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <select
                    value={taskAssigneeFilter}
                    onChange={e => setTaskAssigneeFilter(e.target.value)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '9999px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Personnel ({tasks.length})</option>
                    {employeeUsers.map(u => {
                      const count = tasks.filter(t => 
                        Number(t.assigned_to) === Number(u.id)
                      ).length;
                      return (
                        <option key={u.id} value={u.id}>
                          {u.name} (@{u.username}) — {count} tasks
                        </option>
                      );
                    })}
                  </select>
                  {taskAssigneeFilter !== 'all' && (
                    <button
                      onClick={() => setTaskAssigneeFilter('all')}
                      title="Clear employee filter"
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '9999px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* View Switcher & Create Task Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setTasksViewMode('grid')}
                    title="Grid Cards View"
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: tasksViewMode === 'grid' ? '#ffffff' : 'transparent',
                      color: tasksViewMode === 'grid' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: tasksViewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setTasksViewMode('table')}
                    title="Detailed Master Table View"
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: tasksViewMode === 'table' ? '#ffffff' : 'transparent',
                      color: tasksViewMode === 'table' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: tasksViewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <TableIcon size={15} />
                  </button>
                </div>

                <button
                  onClick={handleOpenCreateTask}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '9999px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.1)'
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Assign New Deliverable</span>
                </button>
              </div>
            </div>

            {/* Live Filter Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
              <div>
                Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> assigned deliverables
                {taskSearch && <span> matching "<em>{taskSearch}</em>"</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                  {pendingTasksCount} Pending
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                  {completedTasksCount} Completed
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
                  {overdueTasksCount} Overdue
                </span>
              </div>
            </div>

            {/* VIEW MODE 1: GRID CARDS */}
            {tasksViewMode === 'grid' && (
              <div className="vashik-grid-tasks" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {filteredTasks.map(task => {
                  const isOverdue = task.status === 'Overdue';
                  const isCompleted = task.status === 'Completed';
                  const assignedEmp = users.find(u => Number(u.id) === Number(task.assigned_to));

                  return (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: `1px solid ${isOverdue ? '#fca5a5' : isCompleted ? '#bbf7d0' : '#e2e8f0'}`,
                        borderRadius: '16px',
                        padding: '1.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                        transition: 'box-shadow 0.2s ease'
                      }}
                    >
                      <div>
                        {/* Priority and Status Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              backgroundColor:
                                task.priority === 'High' ? '#fef2f2' : task.priority === 'Medium' ? '#fffbeb' : '#f1f5f9',
                              color:
                                task.priority === 'High' ? '#dc2626' : task.priority === 'Medium' ? '#d97706' : '#475569',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}>
                              {task.priority} Priority
                            </span>
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              backgroundColor:
                                isCompleted ? '#ecfdf5' : isOverdue ? '#fee2e2' : '#eff6ff',
                              color:
                                isCompleted ? '#047857' : isOverdue ? '#991b1b' : '#1d4ed8',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}>
                              {task.status}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                              #{task.id}
                            </span>
                            <button
                              onClick={() => handleDeleteTask(task)}
                              title="Delete Deliverable"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '0.2rem'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem', lineHeight: 1.4 }}>
                          {task.title}
                        </h4>
                        <p style={{
                          fontSize: '0.8125rem',
                          color: '#64748b',
                          lineHeight: 1.5,
                          marginBottom: '0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {task.description}
                        </p>

                        {/* Full Assignment & Timeline Info Box */}
                        <div style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          marginBottom: '0.85rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <UserCheck size={13} color="#2563eb" /> Assigned To:
                            </span>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>
                              {task.assigned_to_name} (@{task.assigned_to_username})
                              {assignedEmp?.department && <span style={{ color: '#64748b', fontWeight: 500 }}> • {assignedEmp.department}</span>}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Calendar size={13} color="#64748b" /> Assigned When:
                            </span>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              {formatFullDateTime(task.created_at)}
                              {formatRelativeTime(task.created_at) && <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}> ({formatRelativeTime(task.created_at)})</span>}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={13} color={isOverdue ? '#dc2626' : isCompleted ? '#16a34a' : '#2563eb'} /> Target Deadline:
                            </span>
                            <span style={{ fontWeight: 700, color: isOverdue ? '#dc2626' : isCompleted ? '#16a34a' : '#0f172a' }}>
                              {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {isCompleted && task.completed_at && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Finished When:</span>
                              <span style={{ color: '#15803d', fontWeight: 600 }}>{formatFullDateTime(task.completed_at)}</span>
                            </div>
                          )}
                        </div>

                        {/* Live Ticking Countdown Pill */}
                        <div style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: isOverdue ? '#fef2f2' : isCompleted ? '#f0fdf4' : '#eff6ff',
                          border: `1px solid ${isOverdue ? '#fecaca' : isCompleted ? '#bbf7d0' : '#dbeafe'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.85rem'
                        }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: isOverdue ? '#dc2626' : isCompleted ? '#16a34a' : '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <Clock size={13} />
                            {getCountdownString(task.deadline, task.status)}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            {task.status === 'Completed' ? 'Submitted' : isOverdue ? 'Action Required' : 'In Progress'}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f1f5f9',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          onClick={() => setSelectedTask(task)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '9999px',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(15,23,42,0.1)'
                          }}
                        >
                          <Info size={13} />
                          <span>View Full Info</span>
                        </button>

                        <button
                          onClick={() => setSelectedTask(task)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '9999px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <MessageSquare size={12} />
                          <span>Chat ({task.comments.length})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredTasks.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '3.5rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                    <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>No Deliverables Found</h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      No tasks matched your current filter or search criteria.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 2: DETAILED MASTER TABLE VIEW */}
            {tasksViewMode === 'table' && (
              <div className="vashik-table-wrap" style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflowX: 'auto',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', width: '50px' }}>ID</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Deliverable Task</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Assigned Person (Who)</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Assigned Date & Time (When)</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Target Deadline</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Status & Countdown</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Priority</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => {
                      const isOver = task.status === 'Overdue';
                      const isDone = task.status === 'Completed';
                      const assignedEmp = users.find(u => Number(u.id) === Number(task.assigned_to));

                      return (
                        <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#94a3b8' }}>
                            #{task.id}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', maxWidth: '240px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.15rem' }}>
                              {task.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.description}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <div style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                backgroundColor: '#0f172a',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.68rem',
                                fontWeight: 700
                              }}>
                                {task.assigned_to_name[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{task.assigned_to_name}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                  @{task.assigned_to_username} {assignedEmp?.department && `• ${assignedEmp.department}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              {formatFullDateTime(task.created_at)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {formatRelativeTime(task.created_at)}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: isOver ? '#dc2626' : isDone ? '#16a34a' : '#0f172a' }}>
                              {formatFullDateTime(task.deadline)}
                            </div>
                            {isDone && task.completed_at && (
                              <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
                                Completed {formatFullDateTime(task.completed_at)}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              backgroundColor: isDone ? '#ecfdf5' : isOver ? '#fee2e2' : '#eff6ff',
                              color: isDone ? '#047857' : isOver ? '#991b1b' : '#1d4ed8',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              marginBottom: '0.2rem'
                            }}>
                              {task.status}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: isOver ? '#dc2626' : isDone ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                              {getCountdownString(task.deadline, task.status)}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '9999px',
                              backgroundColor: task.priority === 'High' ? '#fee2e2' : task.priority === 'Medium' ? '#fef3c7' : '#f1f5f9',
                              color: task.priority === 'High' ? '#b91c1c' : task.priority === 'Medium' ? '#b45309' : '#475569',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}>
                              {task.priority}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                              <button
                                onClick={() => setSelectedTask(task)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '6px',
                                  backgroundColor: '#0f172a',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                <Info size={12} />
                                <span>Full Info</span>
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task)}
                                title="Delete Deliverable"
                                style={{
                                  padding: '0.35rem',
                                  borderRadius: '6px',
                                  border: '1px solid #fee2e2',
                                  backgroundColor: '#ffffff',
                                  color: '#dc2626',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTasks.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                          No deliverables match the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB: ANNOUNCEMENTS */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'announcements' && (
          <AdminAnnouncementsTab
            announcements={announcements}
            onOpenCreate={handleOpenCreateAnnouncement}
            onOpenEdit={handleOpenEditAnnouncement}
            onDelete={handleDeleteAnnouncement}
            onTogglePin={handleTogglePinAnnouncement}
          />
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: LEADERBOARD & PODIUM */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'leaderboard' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Performance Standings & Leaderboard
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Track employee delivery efficiency and point standings.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={leaderboardSearch}
                    onChange={e => setLeaderboardSearch(e.target.value)}
                    placeholder="Search leaderboard..."
                    style={{
                      width: '100%',
                      padding: '0.45rem 1.8rem 0.45rem 2.1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                  {leaderboardSearch && (
                    <button
                      onClick={() => setLeaderboardSearch('')}
                      style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: '#f1f5f9', padding: '0.2rem', borderRadius: '9999px' }}>
                  {(['all', 'month', 'week'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setLeaderboardPeriod(p)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '9999px',
                        border: 'none',
                        backgroundColor: leaderboardPeriod === p ? '#ffffff' : 'transparent',
                        color: leaderboardPeriod === p ? '#0f172a' : '#64748b',
                        fontWeight: leaderboardPeriod === p ? 700 : 500,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        boxShadow: leaderboardPeriod === p ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      {p === 'all' ? 'All-Time' : p === 'month' ? 'This Month' : 'This Week'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Podium Highlights (Top 3) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              {sortedLeaderboard.slice(0, 3).map((emp, idx) => {
                const medalColors = [
                  { bg: '#fefce8', border: '#fde047', text: '#854d0e', label: '1st Place' },
                  { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', label: '2nd Place' },
                  { bg: '#fff7ed', border: '#fdba74', text: '#9a3412', label: '3rd Place' }
                ];
                const medal = medalColors[idx];

                return (
                  <div
                    key={emp.id}
                    style={{
                      backgroundColor: medal.bg,
                      border: `2px solid ${medal.border}`,
                      borderRadius: '16px',
                      padding: '1.75rem',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: medal.text,
                      letterSpacing: '0.08em'
                    }}>
                      {medal.label}
                    </div>

                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      margin: '0 auto 1rem'
                    }}>
                      {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{emp.name}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      @{emp.username} • {emp.department}
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 1rem',
                      borderRadius: '9999px',
                      backgroundColor: '#ffffff',
                      border: `1px solid ${medal.border}`,
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: '#0f172a'
                    }}>
                      <Zap size={16} color="#eab308" />
                      <span>{emp.points} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Ranking Table */}
            <div className="vashik-table-wrap" style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflowX: 'auto',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', width: '60px' }}>Rank</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Employee</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Department</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Completed</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Overdue</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((emp, index) => {
                    const empTasks = tasks.filter(t => t.assigned_to === emp.id);
                    const comp = empTasks.filter(t => t.status === 'Completed').length;
                    const over = empTasks.filter(t => t.status === 'Overdue').length;

                    return (
                      <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: index < 3 ? '#0f172a' : '#94a3b8' }}>
                          #{index + 1}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{emp.username}</div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>{emp.department}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#16a34a', fontWeight: 600 }}>{comp} tasks</td>
                        <td style={{ padding: '1rem 1.25rem', color: over > 0 ? '#dc2626' : '#64748b', fontWeight: over > 0 ? 700 : 500 }}>
                          {over} tasks
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                          {emp.points} pts
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLeaderboard.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        No personnel found matching "{leaderboardSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 5: AUDIT TRAIL & POINTS LEDGER */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Audited Points Ledger & System Logs
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Cryptographically trackable record of every +5 bonus, -10 overdue deduction, and administrator intervention.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={15} />
                <span>Download Report CSV</span>
              </button>
            </div>

            {/* Points Ledger History Table with Search */}
            <div className="vashik-table-wrap" style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflowX: 'auto',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    Point Changes Ledger ({filteredHistory.length})
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Trackable delta history for on-time bonus rewards and overdue penalties
                  </span>
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={auditLedgerSearch}
                    onChange={e => setAuditLedgerSearch(e.target.value)}
                    placeholder="Search ledger by employee, reason..."
                    style={{
                      width: '100%',
                      padding: '0.4rem 1.8rem 0.4rem 2.1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                  {auditLedgerSearch && (
                    <button
                      onClick={() => setAuditLedgerSearch('')}
                      style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>Employee</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>Delta</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>Balance After</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>Reason & Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(entry => {
                    const emp = users.find(u => u.id === entry.user_id);
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#64748b', fontSize: '0.78rem' }}>
                          {formatFullDateTime(entry.created_at)}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {emp ? `${emp.name} (@${emp.username})` : `User #${entry.user_id}`}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor: entry.change >= 0 ? '#f0fdf4' : '#fef2f2',
                            color: entry.change >= 0 ? '#15803d' : '#b91c1c',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}>
                            {entry.change >= 0 ? `+${entry.change}` : entry.change} pts
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>
                          {entry.balance_after} pts
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>
                          {entry.reason}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        {auditLedgerSearch ? `No ledger records found matching "${auditLedgerSearch}".` : 'No ledger history recorded.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* System Activity Audit Logs Table with Search */}
            <div className="vashik-table-wrap" style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflowX: 'auto',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    System Audit Trail ({filteredAuditLogs.length})
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Tamper-resistant security log of all personnel, assignment, and status modifications
                  </span>
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={auditLogsSearch}
                    onChange={e => setAuditLogsSearch(e.target.value)}
                    placeholder="Search logs by action or detail..."
                    style={{
                      width: '100%',
                      padding: '0.4rem 1.8rem 0.4rem 2.1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                  {auditLogsSearch && (
                    <button
                      onClick={() => setAuditLogsSearch('')}
                      style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', width: '180px' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', width: '220px' }}>Action</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>Log Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#64748b', fontSize: '0.78rem' }}>
                        {formatFullDateTime(log.created_at)}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#334155' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        {auditLogsSearch ? `No audit logs found matching "${auditLogsSearch}".` : 'No audit records logged.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: ADD NEW EMPLOYEE WITH AUTO-GENERATED PASSWORD */}
      {/* =================================================================== */}
      {showAddEmpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Add New Employee</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Auto-generates secure password with one-time reveal. Initial 100 pts credited.
                </p>
              </div>
              <button
                onClick={() => setShowAddEmpModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAddEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpName}
                    onChange={e => {
                      setNewEmpName(e.target.value);
                      if (!newEmpUsername || newEmpUsername.startsWith('emp_')) {
                        const first = e.target.value.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
                        if (first) {
                          setNewEmpUsername(first);
                          setNewEmpEmail(`${first}@vashik.com`);
                          setGenPass(generatePassword(first));
                        }
                      }
                    }}
                    placeholder="e.g. Ramesh Varma"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpUsername}
                    onChange={e => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setNewEmpUsername(clean);
                      setGenPass(generatePassword(clean));
                    }}
                    placeholder="e.g. ramesh"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmpEmail}
                    onChange={e => setNewEmpEmail(e.target.value)}
                    placeholder="ramesh@vashik.com"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Department / Role *
                  </label>
                  <select
                    value={newEmpDept}
                    onChange={e => setNewEmpDept(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI & Automation">AI & Automation</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Design & UI/UX">Design & UI/UX</option>
                    <option value="QA & Testing">QA & Testing</option>
                    <option value="Product Management">Product Management</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newEmpPhone}
                  onChange={e => setNewEmpPhone(e.target.value)}
                  placeholder="+1-555-0199"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Auto-Generated Password Box */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Auto-Generated Initial Password
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <RefreshCw size={12} />
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: copiedPass ? '#ecfdf5' : '#0f172a',
                        color: copiedPass ? '#065f46' : '#ffffff',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {copiedPass ? <Check size={12} /> : <Copy size={12} />}
                      {copiedPass ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '0.05em'
                }}>
                  {genPass}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Rule: username + 4 random digits + special character. Employee will be forced to change password on first login.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '9999px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Create Employee & Reveal Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ONE-TIME CREDENTIALS REVEAL NOTICE */}
      {/* =================================================================== */}
      {empCreatedNotice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 110
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <CheckCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Employee Onboarded!
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                Please share these credentials with the employee. This password will not be shown in plain text again.
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Employee Name</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{empCreatedNotice.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Portal Login URL</span>
                <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.85rem' }}>https://vashik.in/portal</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Username</span>
                <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{empCreatedNotice.username}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Temporary Password</span>
                <div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: '1.05rem' }}>
                  {empCreatedNotice.pass}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleCopyCredentialsSummary}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: copiedNotice ? '#ecfdf5' : '#0f172a',
                  color: copiedNotice ? '#047857' : '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem'
                }}
              >
                {copiedNotice ? <Check size={16} /> : <Copy size={16} />}
                {copiedNotice ? 'Credentials Summary Copied!' : 'Copy Credentials Summary'}
              </button>

              <button
                onClick={() => setEmpCreatedNotice(null)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: ASSIGN NEW DELIVERABLE TASK */}
      {/* =================================================================== */}
      {showCreateTaskModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Assign Deliverable</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Assign task with deadline, priority, attachments and notes.
                </p>
              </div>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {isAssigningTask ? (
              <div style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '4px solid #eff6ff',
                  borderTopColor: '#2563eb',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '1.25rem'
                }} />
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem'
                }}>
                  <Send size={13} />
                  <span>Dispatching Email via Brevo</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Assigning Deliverable...
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '400px', lineHeight: 1.6, margin: '0 auto' }}>
                  {assignLoadingStep}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCreateTask}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                    Assignee (Employee) *
                  </label>
                  {taskAssignee && (
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                      ✓ Selected: {employeeUsers.find(u => u.id === taskAssignee)?.name}
                    </span>
                  )}
                </div>

                {/* Instant Search Bar for Employees */}
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={assignEmpSearch}
                    onChange={e => setAssignEmpSearch(e.target.value)}
                    placeholder="Search employee by name, username, dept..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 1.8rem 0.5rem 2.2rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                  />
                  {assignEmpSearch && (
                    <button
                      type="button"
                      onClick={() => setAssignEmpSearch('')}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filtered Employee Selection Cards */}
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  backgroundColor: '#ffffff',
                  marginBottom: '0.5rem'
                }}>
                  {employeeUsers
                    .filter(emp => {
                      if (!assignEmpSearch.trim()) return true;
                      const q = assignEmpSearch.toLowerCase().trim();
                      return (
                        emp.name.toLowerCase().includes(q) ||
                        emp.username.toLowerCase().includes(q) ||
                        emp.department.toLowerCase().includes(q) ||
                        emp.email.toLowerCase().includes(q)
                      );
                    })
                    .map(emp => {
                      const isSelected = Number(taskAssignee) === Number(emp.id);
                      const pendingCount = tasks.filter(t => t.assigned_to === emp.id && t.status === 'Pending').length;
                      return (
                        <div
                          key={emp.id}
                          onClick={() => setTaskAssignee(emp.id)}
                          style={{
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            border: `1.5px solid ${isSelected ? '#0f172a' : '#f1f5f9'}`,
                            backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#0f172a' : '#e2e8f0',
                              color: isSelected ? '#ffffff' : '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                                {emp.name} <span style={{ color: '#64748b', fontWeight: 500 }}>@{emp.username}</span>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                {emp.department} • <strong style={{ color: '#0f172a' }}>{emp.points} pts</strong>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '9999px',
                              backgroundColor: pendingCount > 2 ? '#fef3c7' : '#f1f5f9',
                              color: pendingCount > 2 ? '#92400e' : '#475569',
                              fontWeight: 600
                            }}>
                              {pendingCount} active
                            </span>
                            {isSelected && (
                              <CheckCircle size={15} color="#0f172a" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {employeeUsers.filter(emp => {
                    if (!assignEmpSearch.trim()) return true;
                    const q = assignEmpSearch.toLowerCase().trim();
                    return emp.name.toLowerCase().includes(q) || emp.username.toLowerCase().includes(q) || emp.department.toLowerCase().includes(q);
                  }).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                      No matching personnel found for "{assignEmpSearch}".
                    </div>
                  )}
                </div>

                {/* Dropdown fallback */}
                <select
                  required
                  value={taskAssignee}
                  onChange={e => setTaskAssignee(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#475569'
                  }}
                >
                  <option value="">Or select employee from dropdown...</option>
                  {employeeUsers.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (@{emp.username}) — {emp.department} ({emp.points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Deliverable Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement WebSocket Real-Time Chat Engine"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Task Scope & Requirements
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Specify key milestones, performance criteria, and submission requirements..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Priority Level *
                  </label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Deadline (Date & Time) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={taskDeadline}
                    onChange={e => setTaskDeadline(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Attachments & Resources
                </span>

                {/* Add Link */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                  <input
                    type="text"
                    value={taskLinkTitle}
                    onChange={e => setTaskLinkTitle(e.target.value)}
                    placeholder="Link Label (e.g. Figma Prototype)"
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem'
                    }}
                  />
                  <input
                    type="text"
                    value={taskLinkUrl}
                    onChange={e => setTaskLinkUrl(e.target.value)}
                    placeholder="https://figma.com/..."
                    style={{
                      flex: 1.5,
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddLinkToTask}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Attached Links list */}
                {taskLinks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem' }}>
                    {taskLinks.map((l, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ExternalLink size={13} color="#2563eb" />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{l.title}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({l.url})</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveTaskLink(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '9999px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Assign Deliverable
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: POINTS ADJUSTMENT */}
      {/* =================================================================== */}
      {selectedEmpForPoints && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Adjust Points</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  For {selectedEmpForPoints.name} (@{selectedEmpForPoints.username})
                </p>
              </div>
              <button
                onClick={() => setSelectedEmpForPoints(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              fontSize: '0.85rem'
            }}>
              Current Points Balance: <strong>{selectedEmpForPoints.points} pts</strong> (Min: 0 floor)
            </div>

            <form onSubmit={handleConfirmPointsAdjustment}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Adjustment Action
                  </label>
                  <select
                    value={pointsChangeType}
                    onChange={e => setPointsChangeType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="add">Award (+)</option>
                    <option value="deduct">Deduct (-)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Points Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={pointsChangeAmount}
                    onChange={e => setPointsChangeAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Reason (Mandatory Audit Reference) *
                </label>
                <input
                  type="text"
                  required
                  value={pointsChangeReason}
                  onChange={e => setPointsChangeReason(e.target.value)}
                  placeholder="e.g. Exceptional Q3 client delivery / Missed sprint review"
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedEmpForPoints(null)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '9999px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: RESET PASSWORD */}
      {/* =================================================================== */}
      {selectedEmpForPassReset && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Reset Employee Password</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Reset for @{selectedEmpForPassReset.username}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmpForPassReset(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {resetSuccessNotice ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle size={32} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{resetSuccessNotice}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Temporary password: <code>{resetGenPass}</code>
                </div>
                <button
                  onClick={() => setSelectedEmpForPassReset(null)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '9999px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Generated Password
                    </span>
                    <button
                      type="button"
                      onClick={() => setResetGenPass(generatePassword(selectedEmpForPassReset.username))}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      Regenerate
                    </button>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                    {resetGenPass}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedEmpForPassReset(null)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '9999px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPasswordReset}
                    style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '9999px',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Confirm & Apply Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 6: TASK DETAILS & COLLABORATIVE DISCUSSION */}
      {/* =================================================================== */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: selectedTask.priority === 'High' ? '#dc2626' : '#2563eb'
                }}>
                  {selectedTask.priority} Priority Deliverable
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Scope & Brief</span>
                <p style={{ color: '#334155', fontSize: '0.875rem', marginTop: '0.35rem', lineHeight: 1.6 }}>
                  {selectedTask.description}
                </p>
              </div>

              {/* Comprehensive Assignment & Personnel Information Dossier */}
              {(() => {
                const assignedEmp = users.find(u => Number(u.id) === Number(selectedTask.assigned_to));
                const isOverdue = selectedTask.status === 'Overdue';
                const isCompleted = selectedTask.status === 'Completed';

                return (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      {/* Box 1: Assigned Person (Who) */}
                      <div style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <UserCheck size={13} color="#2563eb" /> Assigned Person (Who)
                        </div>
                        <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {selectedTask.assigned_to_name[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                              {selectedTask.assigned_to_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              @{selectedTask.assigned_to_username} {assignedEmp?.department && `• ${assignedEmp.department}`}
                            </div>
                          </div>
                        </div>
                        {assignedEmp?.email && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                            ✉️ {assignedEmp.email}
                          </div>
                        )}
                      </div>

                      {/* Box 2: Assigned When (Timeline) */}
                      <div style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} color="#64748b" /> Assigned When (Delegated)
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
                          {formatFullDateTime(selectedTask.created_at)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {formatRelativeTime(selectedTask.created_at) && `Delegated ${formatRelativeTime(selectedTask.created_at)}`}
                          <span style={{ color: '#0f172a', fontWeight: 600 }}> • By Administrator</span>
                        </div>
                      </div>

                      {/* Box 3: Target Deadline */}
                      <div style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        backgroundColor: isOverdue ? '#fef2f2' : isCompleted ? '#f0fdf4' : '#eff6ff',
                        border: `1px solid ${isOverdue ? '#fecaca' : isCompleted ? '#bbf7d0' : '#dbeafe'}`
                      }}>
                        <div style={{ fontSize: '0.7rem', color: isOverdue ? '#b91c1c' : isCompleted ? '#15803d' : '#1d4ed8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} /> Target Completion Deadline
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isOverdue ? '#dc2626' : isCompleted ? '#16a34a' : '#0f172a', marginTop: '0.35rem' }}>
                          {formatFullDateTime(selectedTask.deadline)}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isOverdue ? '#dc2626' : isCompleted ? '#16a34a' : '#2563eb', marginTop: '0.2rem' }}>
                          {getCountdownString(selectedTask.deadline, selectedTask.status)}
                        </div>
                      </div>

                      {/* Box 4: Deliverable State & Points Audit */}
                      <div style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Zap size={13} color="#eab308" /> Points Ledger Impact
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
                          {selectedTask.status === 'Completed'
                            ? (selectedTask.points_bonus_awarded ? '✓ +5 Pts Bonus Awarded' : 'Completed')
                            : selectedTask.status === 'Overdue'
                              ? '⚠️ -10 Pts Overdue Deduction Applied'
                              : 'Eligible for +5 Pts Bonus on Time'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Deliverable #{selectedTask.id} • {selectedTask.priority} Priority
                        </div>
                      </div>
                    </div>

                    {/* Completion Audit Log if Completed */}
                    {isCompleted && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        fontSize: '0.78rem',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <span>
                          <strong>✓ Completion Verified:</strong> Finished on {formatFullDateTime(selectedTask.completed_at)}
                        </span>
                        <span style={{ fontWeight: 700 }}>
                          On-Time Delivery Status: {selectedTask.points_bonus_awarded ? '+5 pts bonus applied' : 'Standard completion'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Reassign Deliverable Section */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <RotateCcw size={14} color="#0f172a" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Reassign Deliverable
                    </span>
                  </div>
                  {!isReassigning ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsReassigning(true);
                        setReassignTargetEmpId('');
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer'
                      }}
                    >
                      Change Assignee
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsReassigning(false)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isReassigning && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                      Select New Employee Assignee (Automatic email will be sent):
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <select
                        value={reassignTargetEmpId}
                        onChange={e => setReassignTargetEmpId(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          flex: 1,
                          minWidth: '220px',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8rem',
                          backgroundColor: '#ffffff',
                          color: '#0f172a'
                        }}
                      >
                        <option value="">Choose an employee...</option>
                        {employeeUsers.map(emp => (
                          <option
                            key={emp.id}
                            value={emp.id}
                            disabled={Number(emp.id) === Number(selectedTask.assigned_to)}
                          >
                            {emp.name} (@{emp.username}) — {emp.department} {Number(emp.id) === Number(selectedTask.assigned_to) ? '(Current Assignee)' : ''}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={!reassignTargetEmpId || Number(reassignTargetEmpId) === Number(selectedTask.assigned_to)}
                        onClick={() => {
                          if (reassignTargetEmpId) {
                            handleReassignTask(selectedTask, Number(reassignTargetEmpId));
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          backgroundColor: (!reassignTargetEmpId || Number(reassignTargetEmpId) === Number(selectedTask.assigned_to)) ? '#94a3b8' : '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: (!reassignTargetEmpId || Number(reassignTargetEmpId) === Number(selectedTask.assigned_to)) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Confirm Reassign & Notify
                      </button>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                      ⚡ An automated Brevo transactional email will be immediately delivered to the new assignee.
                    </span>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {selectedTask.attachments.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Deliverable Resources & Attachments
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {selectedTask.attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.url_or_path}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#2563eb',
                          fontSize: '0.8125rem',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={14} />
                        <span style={{ fontWeight: 600 }}>{att.original_name || att.url_or_path}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Completion Submission Note */}
              {selectedTask.completion_note && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                    ✓ Employee Submission Note ({new Date(selectedTask.completed_at || '').toLocaleString()})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#14532d', marginTop: '0.35rem' }}>
                    {selectedTask.completion_note}
                  </div>
                </div>
              )}

              {/* Discussion Thread */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Discussion & Team Feedback ({selectedTask.comments.length})
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.75rem 0 1rem' }}>
                  {selectedTask.comments.map(c => (
                    <div
                      key={c.id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        backgroundColor: c.user_role === 'admin' ? '#eff6ff' : '#f8fafc',
                        border: `1px solid ${c.user_role === 'admin' ? '#bfdbfe' : '#e2e8f0'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>
                          {c.user_name} {c.user_role === 'admin' ? '(Admin)' : ''}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#334155' }}>{c.message}</div>
                    </div>
                  ))}
                  {selectedTask.comments.length === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      No comments yet. Post feedback below.
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleAdminComment} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={adminReplyComment}
                    onChange={e => setAdminReplyComment(e.target.value)}
                    placeholder="Write administrative guidance or reply..."
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Send size={13} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 7: SUPABASE CLOUD SYNC CONFIGURATION */}
      {/* =================================================================== */}
      {showSupabaseModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="#0f172a" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Supabase Cloud Database</h3>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              The portal connects to your Supabase PostgreSQL instance for real-time synchronization of users, deliverables, and ledger points.
            </p>

            <div style={{
              padding: '0.85rem',
              borderRadius: '10px',
              backgroundColor: supabaseConnected ? '#ecfdf5' : '#f8fafc',
              border: `1px solid ${supabaseConnected ? '#a7f3d0' : '#e2e8f0'}`,
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.85rem', color: supabaseConnected ? '#065f46' : '#334155' }}>
                <CheckCircle size={16} />
                <span>Status: {supabaseConnected ? 'Connected & Synchronized' : 'Using Local Storage Fallback'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                Project URL: <code>{supabaseUrlInput || 'https://tpkncyjgkpnknhjkwjkk.supabase.co'}</code>
              </div>
            </div>

            <button
              onClick={() => {
                PortalStorage.syncFromSupabase().then(() => {
                  refreshAllData();
                  alert('Supabase synchronization refreshed!');
                });
              }}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '9999px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              Trigger Cloud Refresh Now
            </button>

            <button
              onClick={() => setShowSupabaseModal(false)}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* =================================================================== */}
      {/* MODAL 8: ASSIGNED DELIVERABLES FOR EMPLOYEE */}
      {/* =================================================================== */}
      {selectedEmpForTasks && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafbfc',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}>
                  {selectedEmpForTasks.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {selectedEmpForTasks.name}
                    </h3>
                    <span style={{
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      backgroundColor: selectedEmpForTasks.is_active ? '#ecfdf5' : '#f1f5f9',
                      color: selectedEmpForTasks.is_active ? '#047857' : '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      {selectedEmpForTasks.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    @{selectedEmpForTasks.username} • {selectedEmpForTasks.department} • <strong style={{ color: '#0f172a' }}>{selectedEmpForTasks.points} Points</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmpForTasks(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.35rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body with Task List */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {(() => {
                const empTasksList = tasks.filter(t => 
                  Number(t.assigned_to) === Number(selectedEmpForTasks.id)
                );
                const filteredEmpTasks = empTasksList.filter(t => {
                  if (!empModalTaskSearch.trim()) return true;
                  const q = empModalTaskSearch.toLowerCase().trim();
                  return (
                    t.title.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q) ||
                    t.priority.toLowerCase().includes(q) ||
                    t.status.toLowerCase().includes(q)
                  );
                });
                const pending = empTasksList.filter(t => t.status === 'Pending');
                const completed = empTasksList.filter(t => t.status === 'Completed');
                const overdue = empTasksList.filter(t => t.status === 'Overdue');

                return (
                  <div>
                    {/* Quick KPI stats row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Assigned</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>{empTasksList.length}</div>
                      </div>
                      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 600, textTransform: 'uppercase' }}>Active</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1d4ed8' }}>{pending.length}</div>
                      </div>
                      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d' }}>{completed.length}</div>
                      </div>
                      <div style={{ backgroundColor: overdue.length > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${overdue.length > 0 ? '#fecaca' : '#e2e8f0'}`, borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: overdue.length > 0 ? '#dc2626' : '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Overdue</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: overdue.length > 0 ? '#b91c1c' : '#64748b' }}>{overdue.length}</div>
                      </div>
                    </div>

                    {/* Search and Actions bar inside modal */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', width: '240px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                          type="text"
                          value={empModalTaskSearch}
                          onChange={e => setEmpModalTaskSearch(e.target.value)}
                          placeholder="Search tasks..."
                          style={{
                            width: '100%',
                            padding: '0.4rem 1.8rem 0.4rem 2.1rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            outline: 'none',
                            color: '#0f172a'
                          }}
                        />
                        {empModalTaskSearch && (
                          <button
                            onClick={() => setEmpModalTaskSearch('')}
                            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            const empId = selectedEmpForTasks.id;
                            setSelectedEmpForTasks(null);
                            handleOpenCreateTask();
                            setTaskAssignee(empId);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '9999px',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <PlusCircle size={13} />
                          <span>Assign New Task</span>
                        </button>

                        <button
                          onClick={() => {
                            setTaskAssigneeFilter(String(selectedEmpForTasks.id));
                            setActiveTab('tasks');
                            setSelectedEmpForTasks(null);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '9999px',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <span>Filter in Tasks Tab →</span>
                        </button>
                      </div>
                    </div>

                    {/* Task Cards List */}
                    {empTasksList.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '2.5rem 1.5rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px dashed #cbd5e1'
                      }}>
                        <Clock size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          No Deliverables Assigned Yet
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                          @{selectedEmpForTasks.username} has no tasks on record.
                        </div>
                        <button
                          onClick={() => {
                            const empId = selectedEmpForTasks.id;
                            setSelectedEmpForTasks(null);
                            handleOpenCreateTask();
                            setTaskAssignee(empId);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 1rem',
                            borderRadius: '9999px',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <PlusCircle size={14} />
                          <span>Assign Deliverable Now</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {filteredEmpTasks.map(task => {
                          const isOver = task.status === 'Overdue';
                          const isDone = task.status === 'Completed';

                          return (
                            <div
                              key={task.id}
                              style={{
                                border: `1px solid ${isOver ? '#fca5a5' : isDone ? '#bbf7d0' : '#e2e8f0'}`,
                                backgroundColor: isOver ? '#fffbfb' : isDone ? '#fbfdfb' : '#ffffff',
                                borderRadius: '12px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.65rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '9999px',
                                      backgroundColor: task.priority === 'High' ? '#fee2e2' : task.priority === 'Medium' ? '#fef3c7' : '#f1f5f9',
                                      color: task.priority === 'High' ? '#b91c1c' : task.priority === 'Medium' ? '#b45309' : '#475569'
                                    }}>
                                      {task.priority} Priority
                                    </span>

                                    <span style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '9999px',
                                      backgroundColor: isDone ? '#dcfce7' : isOver ? '#fee2e2' : '#dbeafe',
                                      color: isDone ? '#15803d' : isOver ? '#b91c1c' : '#1d4ed8'
                                    }}>
                                      {task.status}
                                    </span>
                                  </div>
                                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                    {task.title}
                                  </h4>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedEmpForTasks(null);
                                    setSelectedTask(task);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#0f172a',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <Info size={12} />
                                  <span>View Full Info</span>
                                </button>
                              </div>

                              {task.description && (
                                <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                                  {task.description}
                                </p>
                              )}

                              {/* Assignment info line */}
                              <div style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.72rem',
                                color: '#475569',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>📅 <strong>Assigned When:</strong> {formatFullDateTime(task.created_at)}</span>
                                  <span>⏰ <strong>Due:</strong> {formatFullDateTime(task.deadline)}</span>
                                </div>
                                {isDone && task.completed_at && (
                                  <div style={{ color: '#16a34a', fontWeight: 600 }}>
                                    ✓ Finished On: {formatFullDateTime(task.completed_at)}
                                  </div>
                                )}
                              </div>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderTop: '1px solid #f1f5f9',
                                paddingTop: '0.65rem',
                                fontSize: '0.75rem',
                                color: '#64748b',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <Clock size={13} color={isOver ? '#dc2626' : '#64748b'} />
                                  <span style={{ fontWeight: 600, color: isOver ? '#dc2626' : '#0f172a' }}>
                                    {getCountdownString(task.deadline, task.status)}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                  {task.attachments?.length > 0 && (
                                    <span>📎 {task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}</span>
                                  )}
                                  {task.comments?.length > 0 && (
                                    <span>💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}</span>
                                  )}
                                </div>
                              </div>

                              {isDone && task.completion_note && (
                                <div style={{
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '8px',
                                  padding: '0.5rem 0.75rem',
                                  fontSize: '0.75rem',
                                  color: '#166534'
                                }}>
                                  <strong>Completion Note:</strong> {task.completion_note}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {filteredEmpTasks.length === 0 && empTasksList.length > 0 && (
                          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                            No deliverables found matching "{empModalTaskSearch}".
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.9rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#fafbfc',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedEmpForTasks(null)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Create / Edit Modal */}
      <AdminAnnouncementModal
        isOpen={showAnnouncementModal}
        editingAnnouncement={editingAnnouncement}
        onClose={() => {
          setShowAnnouncementModal(false);
          setEditingAnnouncement(null);
        }}
        onSave={handleSaveAnnouncement}
      />

      {/* Responsive Global Mobile Styles */}
      <style>{`
        @media (max-width: 768px) {
          .vashik-admin-header {
            height: auto !important;
            padding: 0.85rem 1rem !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .vashik-header-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
          }
          .vashik-header-actions {
            display: flex !important;
            align-items: center !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            width: 100% !important;
            padding-bottom: 0.25rem !important;
            gap: 0.5rem !important;
          }
          .vashik-header-actions::-webkit-scrollbar {
            display: none !important;
          }
          .vashik-header-actions > button,
          .vashik-header-actions > div {
            flex-shrink: 0 !important;
          }
          .vashik-tabs-nav {
            overflow-x: auto !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            width: 100% !important;
            padding-bottom: 0.35rem !important;
            gap: 0.4rem !important;
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
          .vashik-table-wrap {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            width: 100% !important;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
