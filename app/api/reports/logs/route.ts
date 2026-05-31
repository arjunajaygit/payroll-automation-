import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAuth } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

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

    const logs = await prisma.emailLog.findMany({
      where: { adminId },
      orderBy: { sentAt: "desc" },
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

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const mappedLogs = logs.map(log => {
      const latestSalary = log.employee.salaries[0];
      
      const fallbackMonth = latestSalary ? latestSalary.month : monthNames[log.sentAt.getMonth()];
      const fallbackYear = latestSalary ? latestSalary.year : log.sentAt.getFullYear();
      
      return {
        id: log.id,
        employeeId: log.employeeId,
        employeeName: log.employee.name,
        email: log.employee.email,
        month: log.month || fallbackMonth,
        year: log.year || fallbackYear,
        status: log.status,
        sentAt: log.sentAt
      };
    });

    const filteredLogs = mappedLogs.filter(log => log.month === month && log.year === parseInt(year));

    const flatData = filteredLogs.map(l => ({
      "Employee ID": l.employeeId,
      "Name": l.employeeName,
      "Email": l.email,
      "Month": l.month,
      "Year": l.year,
      "Status": l.status,
      "Sent At": l.sentAt
    }));

    return NextResponse.json(flatData);
  } catch (error) {
    console.error("Export logs error:", error);
    return NextResponse.json({ error: "Failed to export email logs" }, { status: 500 });
  }
}
