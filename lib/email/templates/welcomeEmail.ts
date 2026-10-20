export interface WelcomeEmailData {
  employeeName: string;
  username: string;
  tempPassword?: string;
  loginUrl?: string;
  supportEmail?: string;
}

export interface EmailTemplateOutput {
  subject: string;
  html: string;
  text: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): EmailTemplateOutput {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vashik.in/portal';
  const loginUrl = (data.loginUrl && !data.loginUrl.includes('localhost')) ? data.loginUrl : configuredUrl;

  const {
    employeeName,
    username,
    tempPassword,
    supportEmail = process.env.BREVO_SENDER_EMAIL || 'support@vashik.com'
  } = data;

  const subject = `Welcome to Vashik Technologies, ${employeeName}!`;

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
        <!-- Main Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 36px 36px 30px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin-bottom: 6px;">
                      VASHIK <span style="color: #94a3b8; font-weight: 400; font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; margin-left: 8px;">TECHNOLOGIES</span>
                    </div>
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #38bdf8;">
                      Official Personnel Onboarding
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0; letter-spacing: -0.02em;">
                Welcome to the team, ${employeeName}!
              </h1>
              
              <p style="font-size: 15px; line-height: 1.65; color: #334155; margin: 0 0 20px 0;">
                We are thrilled to welcome you to <strong>Vashik Technologies</strong>. As a key member of our engineering and delivery team, your workspace has been provisioned and is ready for access.
              </p>

              <!-- Account Details Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                      Your Access Credentials
                    </div>

                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="130" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">
                          Workspace Portal:
                        </td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                          <a href="${loginUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${loginUrl}</a>
                        </td>
                      </tr>
                      <tr>
                        <td width="130" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">
                          Username:
                        </td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #0f172a; font-family: monospace;">
                          ${username}
                        </td>
                      </tr>
                      ${tempPassword ? `
                      <tr>
                        <td width="130" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748b;">
                          Temporary Password:
                        </td>
                        <td style="padding: 6px 0;">
                          <span style="font-size: 14px; font-weight: 800; font-family: monospace; background-color: #ffffff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; color: #0f172a; letter-spacing: 0.05em; display: inline-block;">
                            ${tempPassword}
                          </span>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Password Reset Warning Note -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1e40af; font-weight: 600;">
                      🔒 Security Note: Please change your password after your first login.
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #3b82f6;">
                      You will be automatically prompted to choose your own confidential password upon initial sign in.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); text-align: center;">
                      Sign In to Employee Portal &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <span style="font-size: 12px; color: #94a3b8;">
                      Or paste this link into your browser: <a href="${loginUrl}" style="color: #64748b; text-decoration: underline;">${loginUrl}</a>
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Support Note -->
              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 28px 0 0 0; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                If you have any questions or require IT assistance setting up your workspace, reach out to our team at <a href="mailto:${supportEmail}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${supportEmail}</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a;">
                Vashik Technologies
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Enterprise Engineering, Cloud Architecture & Scalable Solutions
              </p>
              <p style="margin: 10px 0 0 0; font-size: 10px; color: #cbd5e1;">
                This automated message was sent to an authorized employee account. Please do not forward your credentials.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Welcome to Vashik Technologies, ${employeeName}!

We are thrilled to welcome you to Vashik Technologies. Your employee account has been created.

ACCOUNT DETAILS:
- Login URL: ${loginUrl}
- Username: ${username}
${tempPassword ? `- Temporary Password: ${tempPassword}\n` : ''}
SECURITY NOTE:
Please change your password after your first login. You will be prompted to choose a new password upon initial sign in.

SUPPORT:
If you need assistance, please contact us at ${supportEmail}.

Best regards,
Vashik Technologies Team
${loginUrl}
`;

  return { subject, html, text };
}
