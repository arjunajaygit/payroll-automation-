import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAuth } from "../../../../lib/auth";

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
      },
      orderBy: {
        employee: {
          name: "asc"
        }
      }
    });

    const flatData = salaries.map(s => ({
      "Employee ID": s.employee.employeeId,
      "Name": s.employee.name,
      "Email": s.employee.email,
      "Designation": s.employee.designation,
      "Month": s.month,
      "Year": s.year,
      "Base Salary": s.baseSalary,
      "HRA": s.hra,
      "Allowances": s.allowances,
      "Deductions": s.deductions,
      "Net Salary": s.netSalary
    }));

    return NextResponse.json(flatData);
  } catch (error) {
    console.error("Export summary error:", error);
    return NextResponse.json({ error: "Failed to export payroll summary" }, { status: 500 });
  }
}
