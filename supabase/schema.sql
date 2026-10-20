-- ==============================================================================
-- VASHIK EMPLOYEE PORTAL — SUPABASE POSTGRESQL SCHEMA
-- Paste this entire script into your Supabase project's "SQL Editor" and click Run.
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_plain VARCHAR(255), -- For admin/demo reference
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
    department VARCHAR(100) NOT NULL DEFAULT 'Engineering',
    phone VARCHAR(30),
    points INTEGER NOT NULL DEFAULT 100 CHECK (points >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    lock_until TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points DESC);

-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_to BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Overdue')),
    completion_note TEXT,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    points_deducted BOOLEAN NOT NULL DEFAULT FALSE,
    points_bonus_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_rule VARCHAR(50) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);

-- 3. TASK ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'image', 'file', 'link')),
    url_or_path TEXT NOT NULL,
    original_name VARCHAR(255),
    is_completion_proof BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. POINTS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.points_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES public.tasks(id) ON DELETE SET NULL,
    task_title VARCHAR(255),
    change INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON public.points_history(user_id);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    task_id BIGINT REFERENCES public.tasks(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 6. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_name VARCHAR(150),
    user_role VARCHAR(20),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.comments(task_id);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- AUTOMATED OVERDUE POINTS DEDUCTION FUNCTION (Supabase Edge or pg_cron)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_overdue_tasks()
RETURNS void AS $$
DECLARE
    task_rec RECORD;
    v_new_points INT;
BEGIN
    FOR task_rec IN 
        SELECT t.id, t.title, t.assigned_to, u.points as current_points
        FROM public.tasks t
        JOIN public.users u ON t.assigned_to = u.id
        WHERE t.status = 'Pending' 
          AND t.deadline < CURRENT_TIMESTAMP 
          AND t.points_deducted = FALSE
    LOOP
        -- Calculate new points floor at 0
        v_new_points := GREATEST(0, task_rec.current_points - 10);

        -- Update task status
        UPDATE public.tasks 
        SET status = 'Overdue', points_deducted = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = task_rec.id;

        -- Update employee points
        UPDATE public.users 
        SET points = v_new_points, updated_at = CURRENT_TIMESTAMP
        WHERE id = task_rec.assigned_to;

        -- Record in points history
        INSERT INTO public.points_history (user_id, task_id, task_title, change, balance_after, reason)
        VALUES (
            task_rec.assigned_to,
            task_rec.id,
            task_rec.title,
            -10,
            v_new_points,
            'Overdue penalty: Deadline missed for task "' || task_rec.title || '"'
        );

        -- Record notification
        INSERT INTO public.notifications (user_id, type, message, task_id)
        VALUES (
            task_rec.assigned_to,
            'points_deducted',
            'Overdue Alert: 10 points deducted for missing deadline on "' || task_rec.title || '". Balance: ' || v_new_points || ' pts.',
            task_rec.id
        );

        -- Audit log
        INSERT INTO public.audit_logs (user_id, action, details)
        VALUES (
            task_rec.assigned_to,
            'TASK_OVERDUE_PENALTY',
            'Task #' || task_rec.id || ' overdue. -10 points deducted. New balance: ' || v_new_points || ' pts.'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- If pg_cron is enabled in Supabase extensions, uncomment:
-- SELECT cron.schedule('check-overdue-every-minute', '* * * * *', 'SELECT public.process_overdue_tasks();');

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- Allows anon key to read and mutate for the portal application
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public anon access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to attachments" ON public.task_attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to points_history" ON public.points_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- Default Admin: admin / AdminPassword123!
-- ==============================================================================
INSERT INTO public.users (name, username, email, password_hash, password_plain, role, department, points, is_active, must_change_password)
VALUES 
(
    'System Administrator',
    'admin',
    'admin@vashik.com',
    '$2b$10$yFjZ7QWc8rZ8JdY4f7aMee0O6Hov5Qh3e1u4zS9vP8d1g3T0bH5wS',
    'AdminPassword123!',
    'admin',
    'Management',
    100,
    TRUE,
    FALSE
),
(
    'Karthik Rao',
    'karthik',
    'karthik@vashik.com',
    '$2b$10$karthik_hash',
    'karthik123!',
    'employee',
    'Engineering',
    115,
    TRUE,
    FALSE
),
(
    'Vamshi Murthy',
    'vamshi',
    'vamshi@vashik.com',
    '$2b$10$vamshi_hash',
    'vamshi123!',
    'employee',
    'Product Architecture',
    105,
    TRUE,
    FALSE
),
(
    'B. Akhil',
    'akhil',
    'akhil@vashik.com',
    '$2b$10$akhil_hash',
    'akhil123!',
    'employee',
    'Infrastructure',
    90,
    TRUE,
    FALSE
),
(
    'T. Harshitha',
    'harshitha',
    'harshitha@vashik.com',
    '$2b$10$harshitha_hash',
    'harshitha123!',
    'employee',
    'Design & UI/UX',
    125,
    TRUE,
    FALSE
)
ON CONFLICT (username) DO NOTHING;

-- 8. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    is_pinned BOOLEAN DEFAULT FALSE,
    buttons JSONB DEFAULT '[]'::jsonb,
    created_by_name VARCHAR(150) DEFAULT 'Vashik Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.announcements(is_pinned);

