import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { generateSecurePDF } from "../../../lib/pdf";

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

    let processedCount = 0;

    await Promise.all(payrollData.map(async (employee: any) => {
      try {
        await prisma.salary.upsert({
          where: {
            employeeId_adminId_month_year: {
              employeeId: employee.employeeId,
              adminId,
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
            adminId,
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
        
        const mailOptions = {
          from: `"PayrollPro System" <${process.env.GMAIL_USER}>`,
          to: employee.email,
          subject: `Salary Document: ${employee.month} ${employee.year}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #334155;">
              <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
                <div style="display: inline-block; background-color: #3b82f6; color: #ffffff; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; font-weight: bold; font-size: 20px; margin-bottom: 12px;">P</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">PayrollPro</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Salary Document &bull; ${employee.month} ${employee.year}</p>
              </div>
              <div style="padding: 32px 24px;">
                <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${employee.name}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6; color: #475569;">Your compensation document for the period of <strong>${employee.month} ${employee.year}</strong> has been successfully processed and is attached to this email.</p>
                
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
              filename: `${employee.name}_SalarySlip_${employee.month}_${employee.year}.pdf`,
              content: pdfBuffer,
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        await prisma.emailLog.create({
          data: { employeeId: employee.employeeId, adminId, status: "Sent" },
        });

        processedCount++;

      } catch (err) {
        console.error(`❌ Failed to send email to ${employee.email}:`, err);
        await prisma.emailLog.create({
          data: {
            employeeId: employee.employeeId,
            adminId,
            status: "Failed",
            errorMessage: err instanceof Error ? err.message : String(err),
          },
        });
      }
    }));

    return NextResponse.json({ 
      success: true,
      message: `Successfully processed ${processedCount} payroll documents.`
    });

  } catch (error) {
    console.error("Payroll processing error:", error);
    return NextResponse.json({ error: "Failed to process payroll" }, { status: 500 });
  }
}