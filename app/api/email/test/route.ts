import { NextResponse } from 'next/server';
import { send_email } from '@/lib/email/brevo';
import { generateWelcomeEmail } from '@/lib/email/templates/welcomeEmail';
import { generateTaskAssignedEmail } from '@/lib/email/templates/taskAssignedEmail';

export async function GET() {
  const hasApiKey = Boolean(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'your_brevo_api_key_here');
  const senderEmail = process.env.BREVO_SENDER_EMAIL || '(not configured)';
  const senderName = process.env.BREVO_SENDER_NAME || 'Vashik Technologies';

  return NextResponse.json({
    status: 'Brevo Email Service Ready',
    configured: hasApiKey,
    senderEmail,
    senderName,
    instructions: 'POST to this endpoint with { "to": "your-email@example.com", "type": "welcome" | "task" } to send a live test.'
  });
}

export async function POST(req: Request) {
  try {
    const { to, type = 'welcome' } = await req.json();

    if (!to) {
      return NextResponse.json({ success: false, error: 'Recipient "to" email is required' }, { status: 400 });
    }

    let template;
    if (type === 'task') {
      template = generateTaskAssignedEmail({
        employeeName: 'Test Recipient',
        taskTitle: 'Verify Brevo Transactional Email Integration',
        description: 'This is a test notification confirming that the automated Brevo email delivery pipeline is operational for Vashik Technologies.',
        priority: 'High',
        dueDate: new Date(Date.now() + 48 * 3600000).toISOString(),
        assignedBy: 'Vashik IT Automation',
        isReassignment: false
      });
    } else {
      template = generateWelcomeEmail({
        employeeName: 'Test Recipient',
        username: 'test_user',
        tempPassword: 'Temp@' + Math.floor(1000 + Math.random() * 9000),
        loginUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://vashik.in/portal'
      });
    }

    const result = await send_email({
      to: { email: to, name: 'Test Recipient' },
      subject: `[Test] ${template.subject}`,
      html: template.html,
      text: template.text
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Error executing test' }, { status: 500 });
  }
}
