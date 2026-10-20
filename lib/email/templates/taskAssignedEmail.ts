export interface TaskAssignedEmailData {
  employeeName: string;
  taskTitle: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | string;
  dueDate: string;
  assignedBy?: string;
  taskUrl?: string;
  isReassignment?: boolean;
}

export interface EmailTemplateOutput {
  subject: string;
  html: string;
  text: string;
}

export function generateTaskAssignedEmail(data: TaskAssignedEmailData): EmailTemplateOutput {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vashik.in/portal';
  const taskUrl = (data.taskUrl && !data.taskUrl.includes('localhost')) ? data.taskUrl : configuredUrl;

  const {
    employeeName,
    taskTitle,
    description,
    priority,
    dueDate,
    assignedBy = 'Vashik',
    isReassignment = false
  } = data;

  const subject = isReassignment
    ? `Task Reassigned: ${taskTitle}`
    : `New Task Assigned: ${taskTitle}`;

  // Format priority colors
  let priorityBg = '#f1f5f9';
  let priorityColor = '#475569';
  let priorityBorder = '#e2e8f0';

  if (priority.toLowerCase() === 'high') {
    priorityBg = '#fef2f2';
    priorityColor = '#b91c1c';
    priorityBorder = '#fecaca';
  } else if (priority.toLowerCase() === 'medium') {
    priorityBg = '#fffbeb';
    priorityColor = '#b45309';
    priorityBorder = '#fde68a';
  } else if (priority.toLowerCase() === 'low') {
    priorityBg = '#f0fdf4';
    priorityColor = '#15803d';
    priorityBorder = '#bbf7d0';
  }

  // Format human-friendly deadline date
  let formattedDeadline = dueDate;
  try {
    const d = new Date(dueDate);
    if (!isNaN(d.getTime())) {
      formattedDeadline = d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  } catch {
    formattedDeadline = dueDate;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 36px 26px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin-bottom: 4px;">
                      VASHIK <span style="color: #94a3b8; font-weight: 400; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; margin-left: 6px;">TECHNOLOGIES</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #38bdf8;">
                      Deliverables & Task Tracking
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <!-- Status Pill -->
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; background-color: ${isReassignment ? '#eff6ff' : '#f8fafc'}; color: ${isReassignment ? '#2563eb' : '#475569'}; border: 1px solid ${isReassignment ? '#bfdbfe' : '#e2e8f0'};">
                  ${isReassignment ? 'Deliverable Reassigned' : 'New Deliverable Assignment'}
                </span>
              </div>

              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em; line-height: 1.3;">
                ${taskTitle}
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Hello <strong>${employeeName}</strong>, ${isReassignment ? 'a deliverable has been reassigned to you' : 'you have been assigned a new deliverable'} by <strong>${assignedBy}</strong>. Please review the details below.
              </p>

              <!-- Task Dossier Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 22px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      
                      <!-- Priority Row -->
                      <tr>
                        <td width="130" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">
                          Priority Level:
                        </td>
                        <td style="padding: 6px 0;">
                          <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${priorityBg}; color: ${priorityColor}; border: 1px solid ${priorityBorder};">
                            ${priority} Priority
                          </span>
                        </td>
                      </tr>

                      <!-- Due Date Row -->
                      <tr>
                        <td width="130" style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #64748b;">
                          Target Due Date:
                        </td>
                        <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                          📅 ${formattedDeadline}
                        </td>
                      </tr>

                      <!-- Assigned By Row -->
                      <tr>
                        <td width="130" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">
                          Assigned By:
                        </td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #0f172a;">
                          👤 ${assignedBy}
                        </td>
                      </tr>

                    </table>

                    <!-- Task Scope & Description -->
                    ${description ? `
                    <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px;">
                        Scope & Description:
                      </div>
                      <div style="font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-line;">
                        ${description}
                      </div>
                    </div>
                    ` : ''}

                  </td>
                </tr>
              </table>

              <!-- Points Policy Callout -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin: 20px 0 28px 0;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; font-size: 12px; color: #166534; line-height: 1.5;">
                      ✨ <strong>On-Time Delivery Bonus:</strong> Complete this task before the target deadline to automatically receive a <strong>+5 Points</strong> bonus credit to your employee ledger!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${taskUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); text-align: center;">
                      View Task in Portal &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <span style="font-size: 12px; color: #94a3b8;">
                      Direct portal link: <a href="${taskUrl}" style="color: #64748b; text-decoration: underline;">${taskUrl}</a>
                    </span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a;">
                Vashik Technologies
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Deliverables, Milestones & Engineering Performance Tracking
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${isReassignment ? 'Task Reassigned' : 'New Task Assigned'}: ${taskTitle}

Hello ${employeeName},
${isReassignment ? 'A deliverable has been reassigned to you' : 'You have been assigned a new deliverable'} by ${assignedBy}.

TASK DETAILS:
- Title: ${taskTitle}
- Priority: ${priority} Priority
- Target Due Date: ${formattedDeadline}
- Assigned By: ${assignedBy}

DESCRIPTION:
${description || 'No additional scope details provided.'}

ON-TIME BONUS:
Complete this deliverable before the deadline to earn +5 bonus points!

VIEW DELIVERABLE:
${taskUrl}

Best regards,
Vashik Technologies
`;

  return { subject, html, text };
}
