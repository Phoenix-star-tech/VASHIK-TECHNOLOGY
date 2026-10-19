import { NextResponse } from 'next/server';
import { sendWelcomeNotification } from '@/lib/email/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeName, employeeEmail, username, tempPassword, loginUrl } = body;

    if (!employeeEmail || !username) {
      return NextResponse.json(
        { success: false, error: 'employeeEmail and username are required.' },
        { status: 400 }
      );
    }

    // Dispatch welcome notification asynchronously in background
    sendWelcomeNotification({
      employeeName: employeeName || username,
      employeeEmail,
      username,
      tempPassword,
      loginUrl
    }, { async: true });

    return NextResponse.json({
      success: true,
      message: `Welcome email queued for delivery to ${employeeEmail}`
    });
  } catch (err: any) {
    console.error('[API /api/email/welcome Error]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process email request' },
      { status: 500 }
    );
  }
}
