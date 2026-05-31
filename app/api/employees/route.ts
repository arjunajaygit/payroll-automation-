import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth";

const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export async function GET() {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    
    const employeesDB = await prisma.employee.findMany({
      where: { adminId },
      include: {
        salaries: true,
      },
    });

    const getMonthIndex = (monthStr: string) => {
      const m = monthStr.toLowerCase().substring(0, 3);
      return monthOrder.findIndex(mo => mo.toLowerCase().startsWith(m));
    };

    const employees = employeesDB.map((emp: any) => {
      const sortedSalaries = [...emp.salaries].sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year; 
        }
        return getMonthIndex(b.month) - getMonthIndex(a.month);
      });

      return {
        ...emp,
        salaries: sortedSalaries.length > 0 ? [sortedSalaries[0]] : []
      };
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Fetch employees error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    const { employees } = await request.json();

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