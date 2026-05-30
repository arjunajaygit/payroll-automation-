import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSecurePDF } from "@/lib/pdf";
import { requireAuth } from "../../../lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const yearStr = searchParams.get('year');
    const download = searchParams.get('download');
    const isPreview = searchParams.get('preview') === 'true';

    if (!employeeId || !month || !yearStr) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    const session = await requireAuth();
    const adminId = session.userId;

    const salary = await prisma.salary.findUnique({
      where: {
        employeeId_adminId_month_year: {
          employeeId,
          adminId,
          month,
          year
        }
      },
      include: { employee: true }
    });

    if (!salary) {
      return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
    }

    // Shape the employee object for the pdf generator as it expects a merged object
    const mergedEmployee = {
      ...salary.employee,
      baseSalary: salary.baseSalary,
      hra: salary.hra,
      allowances: salary.allowances,
      deductions: salary.deductions,
      netSalary: salary.netSalary,
      month: salary.month,
      year: salary.year
    };

    const [fontRes, boldFontRes] = await Promise.all([
      fetch("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf"),
      fetch("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf")
    ]);

    const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
    const boldFontBuffer = Buffer.from(await boldFontRes.arrayBuffer());

    const pdfBuffer = await generateSecurePDF(mergedEmployee, fontBuffer, boldFontBuffer, !isPreview);

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    
    if (download === "true" && !isPreview) {
      headers.set("Content-Disposition", `attachment; filename="${salary.employee.name}_SalarySlip_${month}_${year}.pdf"`);
    } else {
      headers.set("Content-Disposition", `inline; filename="${salary.employee.name}_SalarySlip_${month}_${year}.pdf"`);
    }

    return new NextResponse(pdfBuffer as any, { status: 200, headers });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
