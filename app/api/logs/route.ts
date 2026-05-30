import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      include: { 
        employee: {
          include: {
            salaries: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        } 
      }
    });

    const formattedLogs = logs.map(log => {
      const latestSalary = log.employee.salaries[0];
      return {
        id: log.id,
        employeeId: log.employeeId,
        employeeName: log.employee.name,
        month: latestSalary ? latestSalary.month : log.sentAt.toLocaleString('default', { month: 'long' }),
        year: latestSalary ? latestSalary.year : log.sentAt.getFullYear(),
        sentAt: log.sentAt,
        status: log.status,
      };
    });

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Logs API Error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
