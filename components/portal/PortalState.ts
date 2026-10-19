'use client';

import { getSupabaseClient, isSupabaseConfigured, getSupabaseConfig } from '@/lib/supabase';

export type UserRole = 'admin' | 'employee';

export interface PortalUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
  points: number;
  is_active: boolean;
  must_change_password: boolean;
  password_plain?: string;
  completed_tasks_count?: number;
  pending_tasks_count?: number;
  overdue_tasks_count?: number;
  created_at: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'Completed' | 'Overdue';

export interface TaskAttachment {
  id: number;
  task_id: number;
  type: 'text' | 'image' | 'file' | 'link';
  url_or_path: string;
  original_name?: string;
  is_completion_proof?: boolean;
  created_at: string;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  user_role: UserRole;
  message: string;
  created_at: string;
}

export interface PortalTask {
  id: number;
  title: string;
  description: string;
  assigned_to: number;
  assigned_to_name: string;
  assigned_to_username: string;
  created_by?: number;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  completion_note?: string;
  completed_at?: string;
  points_deducted: boolean;
  points_bonus_awarded: boolean;
  is_recurring: boolean;
  recurrence_rule?: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  created_at: string;
}

export interface PointsHistoryEntry {
  id: number;
  user_id: number;
  task_id?: number;
  task_title?: string;
  change: number;
  balance_after: number;
  reason: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  type: 'task_assigned' | 'deadline_warning' | 'points_deducted' | 'points_awarded' | 'task_completed';
  message: string;
  task_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  created_at: string;
}

// Initial seed data
const DEFAULT_USERS: PortalUser[] = [
  {
    id: 1,
    name: 'System Administrator',
    username: 'vashik_admin',
    email: 'admin@vashik.com',
    role: 'admin',
    department: 'Management',
    phone: '+1-555-0100',
    points: 100,
    is_active: true,
    must_change_password: false,
    password_plain: 'Admin@2026!',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 2,
    name: 'Karthik Rao',
    username: 'karthik',
    email: 'karthik@vashik.com',
    role: 'employee',
    department: 'Engineering',
    phone: '+1-555-0112',
    points: 115,
    is_active: true,
    must_change_password: false,
    password_plain: 'karthik123!',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 3,
    name: 'Vamshi Murthy',
    username: 'vamshi',
    email: 'vamshi@vashik.com',
    role: 'employee',
    department: 'Product Architecture',
    phone: '+1-555-0115',
    points: 105,
    is_active: true,
    must_change_password: false,
    password_plain: 'vamshi123!',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 4,
    name: 'B. Akhil',
    username: 'akhil',
    email: 'akhil@vashik.com',
    role: 'employee',
    department: 'Infrastructure',
    phone: '+1-555-0118',
    points: 90,
    is_active: true,
    must_change_password: false,
    password_plain: 'akhil123!',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 5,
    name: 'T. Harshitha',
    username: 'harshitha',
    email: 'harshitha@vashik.com',
    role: 'employee',
    department: 'Design & UI/UX',
    phone: '+1-555-0120',
    points: 125,
    is_active: true,
    must_change_password: false,
    password_plain: 'harshitha123!',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

const DEFAULT_TASKS: PortalTask[] = [
  {
    id: 101,
    title: 'Migrate Cloud Architecture to Kubernetes Cluster',
    description: 'Finalize Helm charts, configure ingress controllers, and perform zero-downtime traffic switch.',
    assigned_to: 2,
    assigned_to_name: 'Karthik Rao',
    assigned_to_username: 'karthik',
    deadline: new Date(Date.now() + 2 * 86400000 + 4 * 3600000).toISOString(),
    priority: 'High',
    status: 'Pending',
    points_deducted: false,
    points_bonus_awarded: false,
    is_recurring: false,
    attachments: [
      {
        id: 1,
        task_id: 101,
        type: 'link',
        url_or_path: 'https://github.com/vashik/infra-charts',
        original_name: 'Kubernetes Helm Repository',
        created_at: new Date().toISOString()
      }
    ],
    comments: [],
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 102,
    title: 'Design Micro-Interactions & 3D WebGL Wireframes',
    description: 'Build interactive wireframe geometry shaders reacting to user pointer coordinates and scroll velocity.',
    assigned_to: 5,
    assigned_to_name: 'T. Harshitha',
    assigned_to_username: 'harshitha',
    deadline: new Date(Date.now() + 18 * 3600000).toISOString(),
    priority: 'Medium',
    status: 'Pending',
    points_deducted: false,
    points_bonus_awarded: false,
    is_recurring: false,
    attachments: [
      {
        id: 3,
        task_id: 102,
        type: 'link',
        url_or_path: 'https://figma.com/@vashik/design-system',
        original_name: 'Figma Prototype Guidelines',
        created_at: new Date().toISOString()
      }
    ],
    comments: [],
    created_at: new Date(Date.now() - 40000000).toISOString()
  },
  {
    id: 103,
    title: 'Audit API Rate Limiting & Auth Tokens',
    description: 'Verify login attempt limiter with 15-minute lockouts and validate token expiration mechanics.',
    assigned_to: 3,
    assigned_to_name: 'Vamshi Murthy',
    assigned_to_username: 'vamshi',
    deadline: new Date(Date.now() - 2 * 3600000).toISOString(),
    priority: 'High',
    status: 'Overdue',
    points_deducted: true,
    points_bonus_awarded: false,
    is_recurring: false,
    attachments: [],
    comments: [],
    created_at: new Date(Date.now() - 100000000).toISOString()
  }
];

const DEFAULT_HISTORY: PointsHistoryEntry[] = [
  {
    id: 1,
    user_id: 5,
    task_id: 100,
    task_title: 'UI Component Overhaul',
    change: 5,
    balance_after: 125,
    reason: 'On-time completion bonus: UI Component Overhaul',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: 2,
    user_id: 3,
    task_id: 103,
    task_title: 'Audit API Rate Limiting',
    change: -10,
    balance_after: 105,
    reason: 'Overdue penalty: Deadline missed for task "Audit API Rate Limiting"',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    user_id: 2,
    type: 'task_assigned',
    message: 'New task assigned: "Migrate Cloud Architecture to Kubernetes Cluster".',
    task_id: 101,
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export class PortalStorage {
  private static STORAGE_PREFIX = 'vashik_portal_';

  static get<T>(key: string, defaultVal: T): T {
    if (typeof window === 'undefined') return defaultVal;
    try {
      const saved = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  static set<T>(key: string, val: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  }

  static getUsers(): PortalUser[] {
    const users = this.get<PortalUser[]>('users', DEFAULT_USERS);
    const admin = users.find(u => u.role === 'admin');
    if (admin && (admin.username === 'admin' || admin.password_plain !== 'Admin@2026!')) {
      admin.username = 'vashik_admin';
      admin.password_plain = 'Admin@2026!';
      this.set('users', users);
    }
    return users;
  }

  static setUsers(users: PortalUser[]): void {
    this.set('users', users);
  }

  static getTasks(): PortalTask[] {
    return this.get<PortalTask[]>('tasks', DEFAULT_TASKS);
  }

  static setTasks(tasks: PortalTask[]): void {
    this.set('tasks', tasks);
  }

  static getHistory(): PointsHistoryEntry[] {
    return this.get<PointsHistoryEntry[]>('history', DEFAULT_HISTORY);
  }

  static setHistory(history: PointsHistoryEntry[]): void {
    this.set('history', history);
  }

  static getNotifications(): NotificationItem[] {
    return this.get<NotificationItem[]>('notifications', DEFAULT_NOTIFICATIONS);
  }

  static setNotifications(notifs: NotificationItem[]): void {
    this.set('notifications', notifs);
  }

  static getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>('audit_logs', []);
  }

  static logAudit(action: string, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: Date.now(),
      action,
      details,
      created_at: new Date().toISOString()
    };
    this.set('audit_logs', [newLog, ...logs.slice(0, 50)]);

    // Also sync to Supabase if available
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('audit_logs').insert([{ action, details }]).then();
    }
  }

  static getSessionUser(): PortalUser | null {
    return this.get<PortalUser | null>('session_user', null);
  }

  static setSessionUser(u: PortalUser | null): void {
    this.set('session_user', u);
  }

  static getEmployeeSession(): PortalUser | null {
    const emp = this.get<PortalUser | null>('employee_session', null);
    if (emp && emp.role === 'employee') return emp;
    const generic = this.getSessionUser();
    if (generic && generic.role === 'employee') return generic;
    return null;
  }

  static setEmployeeSession(u: PortalUser | null): void {
    this.set('employee_session', u);
  }

  static getAdminSession(): PortalUser | null {
    const adm = this.get<PortalUser | null>('admin_session', null);
    if (adm && adm.role === 'admin') return adm;
    const generic = this.getSessionUser();
    if (generic && generic.role === 'admin') return generic;
    return null;
  }

  static setAdminSession(u: PortalUser | null): void {
    this.set('admin_session', u);
  }

  // Live Supabase Sync Layer
  static async syncFromSupabase(): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      // 1. Fetch Users
      const { data: dbUsers, error: userErr } = await supabase.from('users').select('*');
      if (!userErr && dbUsers && dbUsers.length > 0) {
        this.setUsers(dbUsers);
      }

      // 2. Fetch Tasks
      const { data: dbTasks, error: taskErr } = await supabase.from('tasks').select('*');
      if (!taskErr && dbTasks && dbTasks.length > 0) {
        // Fetch comments and attachments
        const { data: dbAttachments } = await supabase.from('task_attachments').select('*');
        const { data: dbComments } = await supabase.from('comments').select('*');

        const enrichedTasks: PortalTask[] = dbTasks.map(t => {
          const userObj = dbUsers?.find(u => Number(u.id) === Number(t.assigned_to));
          return {
            ...t,
            assigned_to_name: userObj?.name || t.assigned_to_name || 'Assigned Personnel',
            assigned_to_username: userObj?.username || t.assigned_to_username || 'user',
            attachments: (dbAttachments || []).filter(a => Number(a.task_id) === Number(t.id)),
            comments: (dbComments || []).filter(c => Number(c.task_id) === Number(t.id))
          };
        });
        this.setTasks(enrichedTasks);
      }

      // 3. Fetch History
      const { data: dbHistory } = await supabase.from('points_history').select('*').order('created_at', { ascending: false });
      if (dbHistory) {
        this.setHistory(dbHistory);
      }

      // 4. Fetch Notifications
      const { data: dbNotifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (dbNotifs) {
        this.setNotifications(dbNotifs);
      }

      return true;
    } catch (e) {
      console.error('Error syncing from Supabase:', e);
      return false;
    }
  }

  // Automatic Background Cron Simulation: Checks overdue tasks and deducts 10 points
  static checkAndProcessOverdue(): boolean {
    const tasks = this.getTasks();
    const users = this.getUsers();
    const history = this.getHistory();
    const notifs = this.getNotifications();
    const now = Date.now();
    let changed = false;

    for (const t of tasks) {
      if (t.status === 'Pending' && new Date(t.deadline).getTime() < now && !t.points_deducted) {
        t.status = 'Overdue';
        t.points_deducted = true;
        changed = true;

        const user = users.find(u => u.id === t.assigned_to);
        if (user) {
          const oldPoints = user.points;
          user.points = Math.max(0, user.points - 10);
          const diff = user.points - oldPoints;

          history.unshift({
            id: Date.now() + Math.random(),
            user_id: user.id,
            task_id: t.id,
            task_title: t.title,
            change: diff,
            balance_after: user.points,
            reason: `Overdue penalty: Deadline missed for task "${t.title}"`,
            created_at: new Date().toISOString()
          });

          notifs.unshift({
            id: Date.now() + Math.random(),
            user_id: user.id,
            type: 'points_deducted',
            message: `Overdue Alert: 10 points deducted for missing deadline on "${t.title}". Balance: ${user.points} pts.`,
            task_id: t.id,
            is_read: false,
            created_at: new Date().toISOString()
          });

          this.logAudit(
            'TASK_OVERDUE_PENALTY',
            `Task #${t.id} ("${t.title}") overdue. -10 points deducted from @${user.username}. Balance: ${user.points} pts.`
          );

          // If Supabase connected, update remote DB
          const supabase = getSupabaseClient();
          if (supabase) {
            supabase.from('tasks').update({ status: 'Overdue', points_deducted: true }).eq('id', t.id).then();
            supabase.from('users').update({ points: user.points }).eq('id', user.id).then();
            supabase.from('points_history').insert([{
              user_id: user.id,
              task_id: t.id,
              task_title: t.title,
              change: diff,
              balance_after: user.points,
              reason: `Overdue penalty: Deadline missed for task "${t.title}"`
            }]).then();
          }
        }
      }
    }

    if (changed) {
      this.setTasks(tasks);
      this.setUsers(users);
      this.setHistory(history);
      this.setNotifications(notifs);
    }

    return changed;
  }
}

export function generatePassword(username: string): string {
  const clean = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'emp';
  const digits = Math.floor(1000 + Math.random() * 9000);
  const chars = ['!', '@', '#', '$', '%', '&', '*'];
  const char = chars[Math.floor(Math.random() * chars.length)];
  return `${clean}${digits}${char}`;
}
