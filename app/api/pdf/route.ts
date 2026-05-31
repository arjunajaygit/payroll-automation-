import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSecurePDF } from "@/lib/pdf";
import { getFontBuffers } from "@/lib/fonts";
import { requireAuth } from "../../../lib/auth";

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

    const fonts = await getFontBuffers();

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const pdfBuffer = await generateSecurePDF(mergedEmployee, fonts.regular, fonts.bold, !isPreview, baseUrl);

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
