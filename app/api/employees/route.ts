import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all existing employees to show on the dashboard
export async function GET() {
  try {
    const employees = await prisma.employee.findMany();
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// Bulk Upload or Update Employees
export async function POST(request: Request) {
  try {
    const { employees } = await request.json();

    // Upsert means it will update the employee if they exist, or create them if they are new
    const upsertPromises = employees.map((emp: any) => 
      prisma.employee.upsert({
        where: { employeeId: emp.employeeId },
        update: {
          name: emp.name,
          email: emp.email,
          designation: emp.designation,
          birthYear: emp.birthYear,
        },
        create: emp,
      })
    );

    await Promise.all(upsertPromises);
    return NextResponse.json({ message: "Employees synchronized successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync employees" }, { status: 500 });
  }
}