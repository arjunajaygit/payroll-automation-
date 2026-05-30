import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSecurePDF } from "../../../lib/pdf";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { payrollData } = await request.json();

    if (!payrollData || payrollData.length === 0) {
      return NextResponse.json({ error: "No payroll data provided" }, { status: 400 });
    }

    const [fontRes, boldFontRes] = await Promise.all([
      fetch("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf"),
      fetch("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf")
    ]);

    const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
    const boldFontBuffer = Buffer.from(await boldFontRes.arrayBuffer());

    const logs = [];

    for (const employee of payrollData) {
      try {
        await prisma.salary.upsert({
          where: {
            employeeId_month_year: {
              employeeId: employee.employeeId,
              month: employee.month,
              year: employee.year,
            },
          },
          update: {
            baseSalary: employee.baseSalary,
            hra: employee.hra,
            allowances: employee.allowances,
            deductions: employee.deductions,
            netSalary: employee.netSalary,
          },
          create: {
            employeeId: employee.employeeId,
            baseSalary: employee.baseSalary,
            hra: employee.hra,
            allowances: employee.allowances,
            deductions: employee.deductions,
            netSalary: employee.netSalary,
            month: employee.month,
            year: employee.year,
          },
        });

        const pdfBuffer = await generateSecurePDF(employee, fontBuffer, boldFontBuffer);
        
        // Upgraded Professional Email Template
        const mailOptions = {
          from: `"HR Department" <${process.env.GMAIL_USER}>`,
          to: employee.email,
          subject: `Secure: Salary Slip for ${employee.month} ${employee.year}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; color: #374151;">
              
              <div style="background-color: #1e3a8a; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Monthly Salary Slip</h1>
                <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px;">${employee.month} ${employee.year}</p>
              </div>
              
              <div style="padding: 32px 24px;">
                <p style="font-size: 16px; margin-top: 0;">Dear <strong>${employee.name}</strong>,</p>
                
                <p style="font-size: 15px; line-height: 1.6;">Your salary slip for the month of ${employee.month} ${employee.year} has been successfully generated and is attached to this email.</p>
                
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                  <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; text-transform: uppercase;">🔒 Important Security Notice</h3>
                  <p style="margin: 0; font-size: 14px; color: #b45309; line-height: 1.5;">
                    To protect your financial data, the attached PDF is securely encrypted.<br><br>
                    <strong>Your Password is:</strong><br>
                    The <strong>first 4 letters</strong> of your first name (in ALL CAPS) followed by your <strong>birth year</strong>.<br>
                    <em>(Example: If your name is Arjun and birth year is 2003, your password is <strong>ARJU2003</strong>)</em>
                  </p>
                </div>

                <div style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">
                    <strong>Note:</strong> If you are reading this in your Spam or Junk folder, please click <em>"Report as not spam"</em> to ensure future payslips arrive in your primary inbox.
                  </p>
                </div>

                <p style="font-size: 15px; margin: 0;">Regards,<br><strong>Human Resources Department</strong></p>
              </div>
              
              <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">Please do not reply directly to this automated email.</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `${employee.name}_SalarySlip_${employee.month}_${employee.year}.pdf`,
              content: pdfBuffer,
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        await prisma.emailLog.create({
          data: { employeeId: employee.employeeId, status: "Sent" },
        });
        logs.push({ email: employee.email, status: "Success" });
        console.log(`✅ Email sent successfully to ${employee.email}`);

      } catch (err) {
        await prisma.emailLog.create({
          data: {
            employeeId: employee.employeeId,
            status: "Failed",
            errorMessage: err instanceof Error ? err.message : String(err),
          },
        });
        logs.push({ email: employee.email, status: "Failed", error: err });
        console.error(`❌ Failed to send email to ${employee.email}:`, err);
      }
    }

    return NextResponse.json({ 
      message: "Automation complete!",
      logs: logs 
    }, { status: 200 });

  } catch (error) {
    console.error("Payroll processing error:", error);
    return NextResponse.json({ error: "Failed to process payroll" }, { status: 500 });
  }
}