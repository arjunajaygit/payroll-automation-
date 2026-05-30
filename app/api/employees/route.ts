import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../../../lib/auth";

const prisma = new PrismaClient();

const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Fetch all existing employees to show on the dashboard
export async function GET() {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    // We include the 'salaries' relation and sort it in memory chronologically
    const employees = await prisma.employee.findMany({
      where: { adminId },
      include: {
        salaries: true
      }
    });

    const sortedEmployees = employees.map(emp => {
      const sortedSalaries = emp.salaries.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
      });
      return { ...emp, salaries: sortedSalaries };
    });

    return NextResponse.json(sortedEmployees);
  } catch (error) {
    console.error("Fetch employees error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// Bulk Upload or Update Employees
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    const { employees } = await request.json();

    // Upsert means it will update the employee if they exist, or create them if they are new
    const upsertPromises = employees.map((emp: any) => 
      prisma.employee.upsert({
        where: { 
          employeeId_adminId: { employeeId: emp.employeeId, adminId } 
        },
        update: {
          name: emp.name,
          email: emp.email,
          designation: emp.designation,
          birthYear: emp.birthYear,
        },
        create: {
          employeeId: emp.employeeId,
          adminId,
          name: emp.name,
          email: emp.email,
          designation: emp.designation,
          birthYear: emp.birthYear,
        },
      })
    );

    await Promise.all(upsertPromises);
    return NextResponse.json({ message: "Employees synchronized successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync employees" }, { status: 500 });
  }
}