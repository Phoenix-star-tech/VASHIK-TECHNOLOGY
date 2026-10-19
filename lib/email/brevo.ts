/**
 * Brevo (formerly Sendinblue) Transactional Email Client
 * Documentation: https://developers.brevo.com/reference/sendtransacemail
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: EmailRecipient;
  tags?: string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Core send_email service using Brevo REST API v3
 * Safe execution: never throws an unhandled exception to the caller.
 */
export async function send_email(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Veshik Technologies';

  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  // Validate recipients with standard email domain format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const validRecipients = recipients.filter(r => r && r.email && emailRegex.test(r.email.trim()));
  if (validRecipients.length === 0) {
    const invalidList = recipients.map(r => r?.email).join(', ');
    const errMsg = `Invalid recipient email address format: "${invalidList}". Please make sure to include a valid domain (e.g. name@gmail.com).`;
    console.error('[Brevo Email Error]', errMsg);
    return { success: false, error: errMsg };
  }

  // Graceful fallback if credentials are missing
  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    const warning = `[Brevo Email Simulated] BREVO_API_KEY is not configured in .env. Would have sent email "${options.subject}" to ${validRecipients.map(r => r.email).join(', ')}`;
    console.warn(warning);
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      error: 'Simulated: BREVO_API_KEY not configured'
    };
  }

  if (!senderEmail || senderEmail === 'your_verified_sender@example.com') {
    const warning = `[Brevo Email Warning] BREVO_SENDER_EMAIL is not configured. Please set a verified sender email in .env.local.`;
    console.warn(warning);
    return {
      success: false,
      error: 'BREVO_SENDER_EMAIL not configured'
    };
  }

  const payload: Record<string, any> = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: validRecipients.map(r => ({
      email: r.email,
      name: r.name || r.email.split('@')[0]
    })),
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.text || options.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  };

  if (options.replyTo && options.replyTo.email) {
    payload.replyTo = {
      email: options.replyTo.email,
      name: options.replyTo.name || senderName
    };
  }

  if (options.tags && options.tags.length > 0) {
    payload.tags = options.tags;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Brevo HTTP error ${response.status}: ${response.statusText}`;
      console.error('[Brevo API Error]', errorMsg, { status: response.status, data });
      return {
        success: false,
        error: errorMsg
      };
    }

    return {
      success: true,
      messageId: data?.messageId || `brevo-${Date.now()}`
    };
  } catch (err: any) {
    console.error('[Brevo Network Exception]', err);
    return {
      success: false,
      error: err?.message || 'Unexpected network error while contacting Brevo API'
    };
  }
}
