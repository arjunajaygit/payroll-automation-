export function buildPayslipEmailHtml(employeeName: string, month: string, year: number): string {
  return `
<p>Dear ${employeeName},</p>
<p>Please find attached your salary slip for ${month} ${year}.</p>
<p>The PDF is password protected.<br>
<strong>Password Hint:</strong> The first 4 letters of your first name (or your full first name if shorter), in uppercase, followed by your birth year.</p>
<p>Regards,<br>
PayrollPro</p>
<br>
<p><small>This is an automated distribution from the PayrollPro platform.<br>
Please do not reply directly to this email.</small></p>
  `;
}

export function buildPayslipEmailText(employeeName: string, month: string, year: number): string {
  return `Dear ${employeeName},

Please find attached your salary slip for ${month} ${year}.

The PDF is password protected.
Password Hint: The first 4 letters of your first name (or your full first name if shorter), in uppercase, followed by your birth year.

Regards,
PayrollPro

This is an automated distribution from the PayrollPro platform.
Please do not reply directly to this email.`;
}
