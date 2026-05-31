import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAuth } from "../../../../lib/auth";
import { transporter } from "../../../../lib/mailer";
import { buildPayslipEmailHtml } from "../../../../lib/emailTemplate";
import { getFontBuffers } from "../../../../lib/fonts";
import { generateSecurePDF } from "../../../../lib/pdf";

export async function POST(request: Request) {
  let parsedBody: { logId?: string; month?: string; year?: number } = {};

  try {
    const session = await requireAuth();
    const adminId = session.userId;
    parsedBody = await request.json();
    const { logId, month, year } = parsedBody;

    if (!logId || !month || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const log = await prisma.emailLog.findUnique({
      where: { id: logId, adminId }
    });

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

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

    const fonts = await getFontBuffers();

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

    const pdfBuffer = await generateSecurePDF(employeeData, fonts.regular, fonts.bold);

    const mailOptions = {
      from: `"PayrollPro System" <${process.env.GMAIL_USER}>`,
      to: employee.email,
      subject: `Salary Document: ${salary.month} ${salary.year}`,
      html: buildPayslipEmailHtml(employee.name, salary.month, salary.year),
      attachments: [
        {
          filename: `${employee.name}_SalarySlip_${salary.month}_${salary.year}.pdf`,
          content: pdfBuffer,
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    await prisma.emailLog.update({
      where: { id: logId },
      data: { status: "Sent", errorMessage: null, sentAt: new Date() }
    });

    return NextResponse.json({ success: true, message: "Email resent successfully" });

  } catch (error) {
    console.error("Resend API Error:", error);

    try {
      if (parsedBody.logId) {
        await prisma.emailLog.update({
          where: { id: parsedBody.logId },
          data: { status: "Failed", errorMessage: error instanceof Error ? error.message : String(error) }
        });
      }
    } catch (e) {
      // Silently ignore if log update fails
    }

    return NextResponse.json({ error: "Failed to resend email" }, { status: 500 });
  }
}
