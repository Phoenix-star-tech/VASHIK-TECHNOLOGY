import { send_email, SendEmailResult } from './brevo';
import { generateWelcomeEmail, WelcomeEmailData } from './templates/welcomeEmail';
import { generateTaskAssignedEmail, TaskAssignedEmailData } from './templates/taskAssignedEmail';

export interface SendWelcomeNotificationParams extends WelcomeEmailData {
  employeeEmail: string;
}

export interface SendTaskAssignmentParams extends TaskAssignedEmailData {
  employeeEmail: string;
}

/**
 * Dispatches an email in the background asynchronously without blocking execution.
 */
function dispatchInBackground(task: () => Promise<any>): void {
  // Use Promise microtask / queue to ensure it never blocks caller execution
  Promise.resolve().then(async () => {
    try {
      await task();
    } catch (err) {
      console.error('[Email Service Background Error]', err);
    }
  });
}

/**
 * Send Welcome Email on employee creation
 * Non-blocking, fails gracefully, sensitive data kept safe.
 */
export async function sendWelcomeNotification(
  params: SendWelcomeNotificationParams,
  options: { async?: boolean } = { async: true }
): Promise<SendEmailResult> {
  const runner = async () => {
    try {
      const { subject, html, text } = generateWelcomeEmail(params);
      const res = await send_email({
        to: {
          email: params.employeeEmail,
          name: params.employeeName
        },
        subject,
        html,
        text,
        tags: ['employee-onboarding', 'welcome-email']
      });

      if (!res.success) {
        console.warn(`[Email Service] Welcome email to ${params.employeeEmail} not delivered: ${res.error}`);
      } else {
        console.log(`[Email Service] Welcome email sent to ${params.employeeEmail} (ID: ${res.messageId})`);
      }
      return res;
    } catch (err: any) {
      console.error('[Email Service Error - Welcome Email]', err?.message || err);
      return { success: false, error: err?.message || 'Unknown error' };
    }
  };

  if (options.async) {
    dispatchInBackground(runner);
    return { success: true, queued: true };
  } else {
    return await runner();
  }
}

/**
 * Send Task Assignment Email when a task is created or reassigned
 * Non-blocking, fails gracefully.
 */
export async function sendTaskAssignmentNotification(
  params: SendTaskAssignmentParams,
  options: { async?: boolean } = { async: true }
): Promise<SendEmailResult> {
  const runner = async () => {
    try {
      const { subject, html, text } = generateTaskAssignedEmail(params);
      const res = await send_email({
        to: {
          email: params.employeeEmail,
          name: params.employeeName
        },
        subject,
        html,
        text,
        tags: ['task-assignment', params.isReassignment ? 'task-reassigned' : 'task-created']
      });

      if (!res.success) {
        console.warn(`[Email Service] Task assignment email to ${params.employeeEmail} not delivered: ${res.error}`);
      } else {
        console.log(`[Email Service] Task assignment email sent to ${params.employeeEmail} (ID: ${res.messageId})`);
      }
      return res;
    } catch (err: any) {
      console.error('[Email Service Error - Task Assignment Email]', err?.message || err);
      return { success: false, error: err?.message || 'Unknown error' };
    }
  };

  if (options.async) {
    dispatchInBackground(runner);
    return { success: true, queued: true };
  } else {
    return await runner();
  }
}
