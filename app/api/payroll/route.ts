import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth";
import { transporter } from "../../../lib/mailer";
import { buildPayslipEmailHtml, buildPayslipEmailText } from "../../../lib/emailTemplate";
import { getFontBuffers } from "../../../lib/fonts";
import { generateSecurePDF } from "../../../lib/pdf";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    const { payrollData } = await request.json();

    if (!payrollData || payrollData.length === 0) {
      return NextResponse.json({ error: "No payroll data provided" }, { status: 400 });
    }

    const fonts = await getFontBuffers();
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

        const pdfBuffer = await generateSecurePDF(employee, fonts.regular, fonts.bold);
        
        const mailOptions = {
          from: '"PayrollPro" <arjundbpro@gmail.com>',
          to: employee.email,
          subject: `Your Salary Slip for ${employee.month} ${employee.year}`,
          html: buildPayslipEmailHtml(employee.name, employee.month, employee.year),
          text: buildPayslipEmailText(employee.name, employee.month, employee.year),
          attachments: [
            {
              filename: `${employee.name}_SalarySlip_${employee.month}_${employee.year}.pdf`,
              content: pdfBuffer,
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        // @ts-ignore: Bypassing stale TS server cache for new schema fields
        await prisma.emailLog.create({
          data: { 
            employeeId: employee.employeeId, 
            adminId, 
            status: "Sent",
            month: employee.month,
            year: employee.year
          } as any,
        });

        processedCount++;

      } catch (err) {
        console.error(`Failed to send email to ${employee.email}:`, err);
        // @ts-ignore: Bypassing stale TS server cache for new schema fields
        await prisma.emailLog.create({
          data: {
            employeeId: employee.employeeId,
            adminId,
            status: "Failed",
            errorMessage: err instanceof Error ? err.message : String(err),
            month: employee.month,
            year: employee.year
          } as any,
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