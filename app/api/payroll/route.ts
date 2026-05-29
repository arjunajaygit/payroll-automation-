import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Upgraded Professional PDF Generator
async function generateSecurePDF(employee: any, fontBuffer: Buffer, boldFontBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const namePart = employee.name.substring(0, 4).toUpperCase();
    const password = `${namePart}${employee.birthYear}`;

    const doc = new PDFDocument({
      userPassword: password,
      ownerPassword: password,
      permissions: { printing: "highResolution" },
      margin: 50,
      size: 'A4'
    });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.registerFont("CustomRoboto", fontBuffer);
    doc.registerFont("CustomRobotoBold", boldFontBuffer);

    // --- 1. HEADER SECTION ---
    doc.fontSize(24).font("CustomRobotoBold").fillColor('#1e3a8a').text("Company Name Inc.", { align: "center" });
    doc.fontSize(10).font("CustomRoboto").fillColor('#6b7280').text("123 Tech Boulevard, Silicon Valley, CA 94025", { align: "center" });
    doc.moveDown(2);
    
    doc.fontSize(16).font("CustomRobotoBold").fillColor('#111827').text("PAYSLIP", { align: "center", underline: true });
    doc.moveDown(1.5);

    // --- 2. EMPLOYEE DETAILS BOX ---
    doc.rect(50, doc.y, 495, 65).strokeColor('#d1d5db').lineWidth(1).stroke(); // Draw a border box
    const detailsY = doc.y + 10;
    
    doc.fontSize(10).font("CustomRobotoBold").fillColor('#374151');
    // Left column
    doc.text("Employee ID:", 65, detailsY);
    doc.text("Name:", 65, detailsY + 15);
    doc.text("Designation:", 65, detailsY + 30);
    // Left column values
    doc.font("CustomRoboto").fillColor('#111827');
    doc.text(employee.employeeId, 140, detailsY);
    doc.text(employee.name, 140, detailsY + 15);
    doc.text(employee.designation, 140, detailsY + 30);

    // Right column
    doc.font("CustomRobotoBold").fillColor('#374151');
    doc.text("Pay Period:", 350, detailsY);
    doc.text("Generated On:", 350, detailsY + 15);
    // Right column values
    doc.font("CustomRoboto").fillColor('#111827');
    doc.text(`${employee.month} ${employee.year}`, 425, detailsY);
    doc.text(new Date().toLocaleDateString(), 425, detailsY + 15);

    doc.y = detailsY + 70; // Move cursor below the box

    // --- 3. SALARY TABLE HEADER ---
    doc.fillColor('#f3f4f6').rect(50, doc.y, 495, 25).fill(); // Grey background
    const tableHeaderY = doc.y + 7;
    
    doc.fontSize(11).font("CustomRobotoBold").fillColor('#111827');
    doc.text("Earnings & Deductions", 65, tableHeaderY);
    doc.text("Amount (Rs.)", 400, tableHeaderY, { width: 130, align: "right" });
    
    doc.y = tableHeaderY + 25;

    // --- 4. SALARY ROWS (Perfectly Aligned) ---
    const drawRow = (label: string, amount: number, isDeduction = false) => {
      doc.fontSize(10).font("CustomRoboto").fillColor('#374151');
      doc.text(label, 65, doc.y);
      
      const amountStr = isDeduction ? `- ${amount.toLocaleString()}` : amount.toLocaleString();
      const color = isDeduction ? '#ef4444' : '#111827'; // Red for deductions
      
      doc.font("CustomRoboto").fillColor(color);
      // We use a fixed width of 130 and align right so the decimals line up perfectly
      doc.text(amountStr, 400, doc.y - 12, { width: 130, align: "right" }); 
      doc.moveDown(0.8);
    };

    drawRow("Base Salary", employee.baseSalary);
    drawRow("House Rent Allowance (HRA)", employee.hra);
    drawRow("Special Allowances", employee.allowances);
    drawRow("Tax & Deductions", employee.deductions, true);

    doc.moveDown(1);

    // --- 5. NET SALARY BOX ---
    doc.fillColor('#dcfce7').rect(50, doc.y, 495, 35).fill(); // Light green background
    const netY = doc.y + 10;
    
    doc.fontSize(12).font("CustomRobotoBold").fillColor('#166534'); // Dark green text
    doc.text("NET PAYABLE SALARY:", 65, netY);
    doc.text(`Rs. ${employee.netSalary.toLocaleString()}`, 400, netY, { width: 130, align: "right" });

    // --- 6. FOOTER ---
doc.y = 700;

// Top line
doc.moveTo(50, doc.y)
   .lineTo(545, doc.y)
   .strokeColor('#d1d5db')
   .stroke();

doc.moveDown(1);

// Footer text
doc.fontSize(9)
   .font("CustomRoboto")
   .fillColor('#9ca3af')
   .text(
      "This is a computer-generated document. No signature is required. For any discrepancies, please contact HR immediately.",
      50, // x position
      doc.y, // y position
      {
        width: 495,
        align: "center"
      }
   );
    doc.end();
  });
}

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