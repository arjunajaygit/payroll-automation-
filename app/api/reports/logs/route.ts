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

    const logs = await prisma.emailLog.findMany({
      where: {
        adminId,
        month,
        year: parseInt(year)
      },
      orderBy: {
        sentAt: "desc"
      }
    });

    const flatData = logs.map(l => ({
      "Employee ID": l.employeeId,
      "Name": l.employeeName,
      "Email": l.email,
      "Month": l.month,
      "Year": l.year,
      "Status": l.status,
      "Sent At": new Date(l.sentAt).toLocaleString()
    }));

    return NextResponse.json(flatData);
  } catch (error) {
    console.error("Export logs error:", error);
    return NextResponse.json({ error: "Failed to export email logs" }, { status: 500 });
  }
}
