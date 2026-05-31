import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAuth } from "../../../../lib/auth";
import { generateSecurePDF } from "../../../../lib/pdf";
import { getFontBuffers } from "../../../../lib/fonts";
import JSZip from "jszip";

// Set maximum duration for this API route if hosted on Vercel
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json({ error: "Missing month or year parameters" }, { status: 400 });
    }

    const salaries = await prisma.salary.findMany({
      where: {
        adminId,
        month,
        year: parseInt(year)
      },
      include: {
        employee: true
      }
    });

    if (salaries.length === 0) {
      return NextResponse.json({ error: "No salary records found for this period" }, { status: 404 });
    }

    const fonts = await getFontBuffers();
    const regularFont = fonts.regular;
    const boldFont = fonts.bold;

    const zip = new JSZip();

    // Generate PDFs sequentially and add them to the zip
    for (const salary of salaries) {
      const employeeData = {
        ...salary.employee,
        baseSalary: salary.baseSalary,
        hra: salary.hra,
        allowances: salary.allowances,
        deductions: salary.deductions,
        netSalary: salary.netSalary,
        month: salary.month,
        year: salary.year
      };

      const pdfBuffer = await generateSecurePDF(employeeData, regularFont, boldFont, true);
      
      // Naming convention: EMP001_Arjun_May2026.pdf
      const fileName = `${salary.employee.employeeId}_${salary.employee.name.replace(/[^a-zA-Z0-9]/g, '_')}_${salary.month}${salary.year}.pdf`;
      
      zip.file(fileName, pdfBuffer);
    }

    // Generate the zip file buffer
    const zipBuffer = await zip.generateAsync({ 
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 5 }
    });

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="payslips_${month}_${year}.zip"`,
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error("Export zip error:", error);
    return NextResponse.json({ error: "Failed to generate ZIP archive" }, { status: 500 });
  }
}
