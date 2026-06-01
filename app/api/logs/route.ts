import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    const adminId = session.userId;

    const logs = await prisma.emailLog.findMany({
      where: { adminId },
      orderBy: { sentAt: 'desc' },
      include: { 
        employee: true
      }
    });

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const formattedLogs = logs.map(log => {
      const fallbackMonth = monthNames[log.sentAt.getMonth()];
      const fallbackYear = log.sentAt.getFullYear();
      
      return {
        id: log.id,
        employeeId: log.employeeId,
        employeeName: log.employee.name,
        email: log.employee.email,
        month: (log as any).month || fallbackMonth,
        year: (log as any).year || fallbackYear,
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
