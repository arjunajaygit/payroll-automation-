import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalHeadcount = await prisma.employee.count();

    const latestSalary = await prisma.salary.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const date = new Date();
    const currentMonth = latestSalary ? latestSalary.month : date.toLocaleString('default', { month: 'long' });
    const currentYear = latestSalary ? latestSalary.year : date.getFullYear();

    const currentMonthSalaries = await prisma.salary.findMany({
      where: { month: currentMonth, year: currentYear },
      include: { employee: true }
    });

    const currentMonthPayroll = currentMonthSalaries.reduce((sum, s) => sum + s.netSalary, 0);

    const averageSalary = totalHeadcount > 0 ? currentMonthPayroll / totalHeadcount : 0;

    const emailLogs = await prisma.emailLog.findMany();
    const totalEmails = emailLogs.length;
    const sentEmails = emailLogs.filter(log => log.status === "Sent").length;
    const emailSuccessRate = totalEmails > 0 ? Math.round((sentEmails / totalEmails) * 100) : 0;

    const deptCosts: Record<string, number> = {};
    currentMonthSalaries.forEach(s => {
      const dept = s.employee?.designation || "Unknown";
      deptCosts[dept] = (deptCosts[dept] || 0) + s.netSalary;
    });
    const departmentCostBreakdown = Object.entries(deptCosts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); 

    const trendData = await prisma.salary.groupBy({
      by: ['month', 'year'],
      _sum: { netSalary: true },
    });

    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    trendData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    const last6Months = trendData.slice(-6).map(t => ({
      month: `${t.month.slice(0, 3)} ${t.year}`,
      cost: t._sum.netSalary || 0
    }));

    return NextResponse.json({
      totalHeadcount,
      currentMonthPayroll,
      averageSalary,
      emailSuccessRate,
      departmentCostBreakdown,
      sixMonthTrend: last6Months,
      currentMonthDisplay: `${currentMonth} ${currentYear}`
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
