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

export type AnnouncementCategory = 'Company Update' | 'Milestone' | 'Event' | 'Urgent' | 'General' | 'Policy';

export interface AnnouncementButton {
  id: string;
  label: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface PortalAnnouncement {
  id: number;
  title: string;
  body: string;
  category: AnnouncementCategory;
  is_pinned: boolean;
  buttons: AnnouncementButton[];
  created_by_name: string;
  created_at: string;
  updated_at?: string;
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

const DEFAULT_ANNOUNCEMENTS: PortalAnnouncement[] = [
  {
    id: 1,
    title: 'Welcome to Vashik Technologies Official Portal & vashik.in',
    body: 'We are thrilled to officially launch our brand new company portal and our updated corporate domain at vashik.in! All employee services, task tracking, deliverable verification, and company updates are now unified under one seamless system. Please explore your portal workspace, check your assigned deliverables, and ensure your profile information is up to date.',
    category: 'Company Update',
    is_pinned: true,
    created_by_name: 'Vashik Admin',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    buttons: [
      {
        id: 'btn-1',
        label: 'Open Employee Portal →',
        url: '/portal',
        variant: 'primary'
      },
      {
        id: 'btn-2',
        label: 'Explore Our Engineering Services',
        url: '/#services',
        variant: 'outline'
      }
    ]
  },
  {
    id: 2,
    title: 'Engineering Milestone: Next-Gen Cloud Platform Delivery',
    body: 'A huge congratulations to our core technical team for successfully provisioning and deploying our high-throughput cloud infrastructure! Reminder to all team leads: on-time completion of deliverables before deadline awards an automatic +5 points bonus on the official VASHIK leaderboard.',
    category: 'Milestone',
    is_pinned: false,
    created_by_name: 'Vashik Admin',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    buttons: [
      {
        id: 'btn-3',
        label: 'View Deliverables & Countdown',
        url: '/portal',
        variant: 'primary'
      }
    ]
  },
  {
    id: 3,
    title: 'Upcoming All-Hands Tech Showcase & Innovation Review',
    body: 'Join the engineering and product team for our upcoming quarterly innovation review. We will review customer feedback, showcase new design system tokens, and recognize top contributors on the points ledger.',
    category: 'Event',
    is_pinned: false,
    created_by_name: 'Vashik Admin',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    buttons: [
      {
        id: 'btn-4',
        label: 'Check Team Leaderboard',
        url: '/portal',
        variant: 'secondary'
      }
    ]
  }
];

export class PortalStorage {
  private static STORAGE_PREFIX = 'vashik_portal_';
  private static announcementListeners: Set<(items: PortalAnnouncement[]) => void> = new Set();
  private static realtimeChannel: any = null;
  private static broadcastChannel: BroadcastChannel | null = null;

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

  // Announcements CRUD & Realtime Subscriptions
  static getAnnouncements(): PortalAnnouncement[] {
    return this.get<PortalAnnouncement[]>('announcements', DEFAULT_ANNOUNCEMENTS);
  }

  static setAnnouncements(items: PortalAnnouncement[]): void {
    this.set('announcements', items);
    this.notifyAnnouncements(items);
  }

  private static notifyAnnouncements(items: PortalAnnouncement[]): void {
    // 1. Notify in-memory listeners
    this.announcementListeners.forEach(fn => {
      try { fn(items); } catch (e) { console.error(e); }
    });

    // 2. Dispatch custom event for components in same window
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('vashik_announcements_updated', { detail: items }));
      } catch {}

      // 3. Post to BroadcastChannel for other open tabs
      try {
        if (!this.broadcastChannel && typeof BroadcastChannel !== 'undefined') {
          this.broadcastChannel = new BroadcastChannel('vashik_announcements_sync');
        }
        this.broadcastChannel?.postMessage({ type: 'announcements_updated', items });
      } catch {}
    }
  }

  static subscribeToAnnouncements(listener: (announcements: PortalAnnouncement[]) => void): () => void {
    this.announcementListeners.add(listener);

    let handleCustomEvent: ((e: any) => void) | null = null;
    let handleStorage: ((e: StorageEvent) => void) | null = null;
    let handleBroadcast: ((e: MessageEvent) => void) | null = null;

    if (typeof window !== 'undefined') {
      handleCustomEvent = () => listener(this.getAnnouncements());
      window.addEventListener('vashik_announcements_updated', handleCustomEvent);

      handleStorage = (e: StorageEvent) => {
        if (e.key === `${this.STORAGE_PREFIX}announcements`) {
          listener(this.getAnnouncements());
        }
      };
      window.addEventListener('storage', handleStorage);

      if (typeof BroadcastChannel !== 'undefined') {
        if (!this.broadcastChannel) {
          this.broadcastChannel = new BroadcastChannel('vashik_announcements_sync');
        }
        handleBroadcast = (ev: MessageEvent) => {
          if (ev.data?.type === 'announcements_updated') {
            listener(this.getAnnouncements());
          }
        };
        this.broadcastChannel.addEventListener('message', handleBroadcast);
      }

      // Initialize Supabase realtime channel
      this.initSupabaseAnnouncementsRealtime();
    }

    return () => {
      this.announcementListeners.delete(listener);
      if (typeof window !== 'undefined') {
        if (handleCustomEvent) window.removeEventListener('vashik_announcements_updated', handleCustomEvent);
        if (handleStorage) window.removeEventListener('storage', handleStorage);
        if (handleBroadcast && this.broadcastChannel) {
          this.broadcastChannel.removeEventListener('message', handleBroadcast);
        }
      }
    };
  }

  static initSupabaseAnnouncementsRealtime(): void {
    if (typeof window === 'undefined') return;
    if (this.realtimeChannel) return; // already active

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      this.realtimeChannel = supabase
        .channel('realtime_announcements_live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'announcements' },
          async (payload) => {
            console.log('[Realtime] Announcement change detected:', payload.eventType, payload);

            // Optimistic deletion
            if (payload.eventType === 'DELETE') {
              const oldId = (payload.old as any)?.id;
              if (oldId !== undefined) {
                const current = this.getAnnouncements();
                const filtered = current.filter(a => Number(a.id) !== Number(oldId));
                this.set('announcements', filtered);
                this.notifyAnnouncements(filtered);
              }
            }

            // Sync authoritative data from Supabase
            await this.syncAnnouncementsFromSupabase();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Supabase Realtime] Connected to announcements channel');
          }
        });
    } catch (err) {
      console.error('[Supabase Realtime] Announcements connection error:', err);
    }
  }

  static async syncAnnouncementsFromSupabase(): Promise<PortalAnnouncement[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.getAnnouncements();

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase Sync Error]:', error.message);
        return this.getAnnouncements();
      }

      if (data) {
        // Keep any pending local announcements (timestamp id) so they are not wiped if DB insert was blocked
        const current = this.getAnnouncements();
        const pendingLocal = current.filter(a => Number(a.id) > 1000000000000 && !data.some((d: any) => d.title === a.title));

        const mapped: PortalAnnouncement[] = [
          ...pendingLocal,
          ...data.map((item: any) => ({
            id: Number(item.id),
            title: item.title,
            body: item.body,
            category: item.category || 'General',
            is_pinned: Boolean(item.is_pinned),
            buttons: Array.isArray(item.buttons) ? item.buttons : [],
            created_by_name: item.created_by_name || 'Vashik Admin',
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at
          }))
        ];

        this.set('announcements', mapped);
        this.notifyAnnouncements(mapped);
        return mapped;
      }
    } catch (e) {
      console.error('Failed to sync announcements:', e);
    }
    return this.getAnnouncements();
  }

  static async addAnnouncement(item: Omit<PortalAnnouncement, 'id' | 'created_at'>): Promise<PortalAnnouncement & { error?: string }> {
    const tempId = Date.now();
    let newAnnouncement: PortalAnnouncement & { error?: string } = {
      ...item,
      id: tempId,
      created_at: new Date().toISOString()
    };
    const current = this.getAnnouncements();
    const updated = [newAnnouncement, ...current];
    this.setAnnouncements(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('announcements').insert([{
          title: newAnnouncement.title,
          body: newAnnouncement.body,
          category: newAnnouncement.category,
          is_pinned: newAnnouncement.is_pinned,
          buttons: newAnnouncement.buttons || [],
          created_by_name: newAnnouncement.created_by_name
        }]).select().single();

        if (error) {
          console.error('[Supabase Announcement Insert Error]:', error);
          newAnnouncement.error = error.message;
        } else if (!error && data) {
          newAnnouncement = {
            id: Number(data.id),
            title: data.title,
            body: data.body,
            category: data.category || 'General',
            is_pinned: Boolean(data.is_pinned),
            buttons: Array.isArray(data.buttons) ? data.buttons : [],
            created_by_name: data.created_by_name || 'Vashik Admin',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at
          };
          const latest = this.getAnnouncements();
          const synced = latest.map(a => Number(a.id) === tempId ? newAnnouncement : a);
          this.setAnnouncements(synced);
        }
      } catch (err: any) {
        console.error('Error inserting announcement to Supabase:', err);
        newAnnouncement.error = err?.message || 'Database error';
      }
    }

    this.logAudit('Announcement Published', `Admin published "${newAnnouncement.title}"`);
    return newAnnouncement;
  }

  static async updateAnnouncement(id: number, updates: Partial<PortalAnnouncement>): Promise<void> {
    const current = this.getAnnouncements();
    const updated = current.map(a => Number(a.id) === Number(id) ? { ...a, ...updates, updated_at: new Date().toISOString() } : a);
    this.setAnnouncements(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('announcements').update({
          ...updates,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (err) {
        console.error('Error updating announcement in Supabase:', err);
      }
    }
    this.logAudit('Announcement Updated', `Announcement ID #${id} updated`);
  }

  static async deleteAnnouncement(id: number): Promise<void> {
    const current = this.getAnnouncements();
    const target = current.find(a => Number(a.id) === Number(id));
    const updated = current.filter(a => Number(a.id) !== Number(id));
    this.setAnnouncements(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('announcements').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting announcement from Supabase:', err);
      }
    }
    if (target) {
      this.logAudit('Announcement Deleted', `Deleted announcement "${target.title}"`);
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

      // 5. Fetch Announcements
      await this.syncAnnouncementsFromSupabase();


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
