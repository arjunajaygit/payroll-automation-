import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../../../../lib/auth";
import nodemailer from "nodemailer";
import { generateSecurePDF } from "../../../../lib/pdf";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
} as any);

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    const { logId, month, year } = await request.json();

    if (!logId || !month || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch the log to verify ownership
    const log = await prisma.emailLog.findUnique({
      where: { id: logId, adminId }
    });

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    // 2. Fetch Employee and Salary data
    const employee = await prisma.employee.findUnique({
      where: {
        employeeId_adminId: { employeeId: log.employeeId, adminId }
      }
    });

    const salary = await prisma.salary.findUnique({
      where: {
        employeeId_adminId_month_year: {
          employeeId: log.employeeId,
          adminId,
          month,
          year: parseInt(year.toString())
        }
      }
    });

    if (!employee || !salary) {
      return NextResponse.json({ error: "Employee or Salary data not found for this period" }, { status: 404 });
    }

    // 3. Fetch fonts for PDF
    const [fontRes, boldFontRes] = await Promise.all([
      fetch("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf"),
      fetch("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf")
    ]);
    const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
    const boldFontBuffer = Buffer.from(await boldFontRes.arrayBuffer());

    // 4. Combine data for PDF generation
    const employeeData = {
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      designation: employee.designation,
      birthYear: employee.birthYear,
      baseSalary: salary.baseSalary,
      hra: salary.hra,
      allowances: salary.allowances,
      deductions: salary.deductions,
      netSalary: salary.netSalary,
      month: salary.month,
      year: salary.year
    };

    // 5. Generate PDF
    const pdfBuffer = await generateSecurePDF(employeeData, fontBuffer, boldFontBuffer);

    // 6. Send Email
    const mailOptions = {
      from: `"PayrollPro System" <${process.env.GMAIL_USER}>`,
      to: employee.email,
      subject: `Salary Document: ${salary.month} ${salary.year}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #334155;">
          <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
            <div style="display: inline-block; background-color: #3b82f6; color: #ffffff; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; font-weight: bold; font-size: 20px; margin-bottom: 12px;">P</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">PayrollPro</h1>
            <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Salary Document &bull; ${salary.month} ${salary.year}</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${employee.name}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6; color: #475569;">Your compensation document for the period of <strong>${salary.month} ${salary.year}</strong> has been successfully processed and is attached to this email.</p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; margin: 24px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 14px; text-transform: uppercase; font-weight: 700;">Document Security</h3>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #15803d; line-height: 1.5;">
                For security reasons, all salary slips are encrypted.
              </p>
              <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.5;">
                <strong>Password Hint:</strong> The first 4 letters of your first name (in uppercase) followed by your birth year.
              </p>
            </div>

            <p style="font-size: 15px; margin: 0; color: #475569;">Best regards,<br><strong style="color: #0f172a;">PayrollPro System</strong></p>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">This is an automated distribution from the PayrollPro platform.</p>
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">Please do not reply directly to this email.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${employee.name}_SalarySlip_${salary.month}_${salary.year}.pdf`,
          content: pdfBuffer,
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // 7. Update Log Status
    await prisma.emailLog.update({
      where: { id: logId },
      data: { status: "Sent", errorMessage: null, sentAt: new Date() }
    });

    return NextResponse.json({ success: true, message: "Email resent successfully" });

  } catch (error) {
    console.error("Resend API Error:", error);
    
    // Attempt to update the log with the new error if we got far enough
    try {
      const { logId } = await request.json();
      if (logId) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: { status: "Failed", errorMessage: error instanceof Error ? error.message : String(error) }
        });
      }
    } catch (e) {
      // Ignore inner error
    }

    return NextResponse.json({ error: "Failed to resend email" }, { status: 500 });
  }
}
