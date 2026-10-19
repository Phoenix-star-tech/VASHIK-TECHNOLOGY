import { NextResponse } from 'next/server';
import { sendTaskAssignmentNotification } from '@/lib/email/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      employeeName,
      employeeEmail,
      taskTitle,
      description,
      priority,
      dueDate,
      assignedBy,
      taskUrl,
      isReassignment
    } = body;

    if (!employeeEmail || !taskTitle) {
      return NextResponse.json(
        { success: false, error: 'employeeEmail and taskTitle are required.' },
        { status: 400 }
      );
    }

    // Dispatch task assignment notification asynchronously in background
    sendTaskAssignmentNotification({
      employeeName: employeeName || 'Team Member',
      employeeEmail,
      taskTitle,
      description: description || '',
      priority: priority || 'Medium',
      dueDate: dueDate || new Date().toISOString(),
      assignedBy: assignedBy || 'System Administrator',
      taskUrl,
      isReassignment: Boolean(isReassignment)
    }, { async: true });

    return NextResponse.json({
      success: true,
      message: `Task assignment email queued for delivery to ${employeeEmail}`
    });
  } catch (err: any) {
    console.error('[API /api/email/task-assigned Error]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process email request' },
      { status: 500 }
    );
  }
}
