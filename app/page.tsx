import { prisma } from "../lib/prisma";
import DashboardClient from "./DashboardClient";
import { requireAuth } from "../lib/auth";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const session = await requireAuth();
    const adminId = session.userId;

    const date = new Date();
    const currentMonth = date.toLocaleString('default', { month: 'long' });
    const currentYear = date.getFullYear();

    const [totalHeadcount, currentMonthSalaries, sentCount, totalEmailCount, trendData] = await Promise.all([
      prisma.employee.count({ where: { adminId } }),
      prisma.salary.findMany({
        where: { adminId, month: currentMonth, year: currentYear },
        include: { employee: true },
      }),
      prisma.emailLog.count({ where: { adminId, status: "Sent" } }),
      prisma.emailLog.count({ where: { adminId } }),
      prisma.salary.groupBy({
        by: ['month', 'year'],
        where: { adminId },
        _sum: { netSalary: true },
      }),
    ]);

    const currentMonthPayroll = currentMonthSalaries.reduce((sum, s) => sum + s.netSalary, 0);
    const averageSalary = totalHeadcount > 0 ? currentMonthPayroll / totalHeadcount : 0;
    const emailSuccessRate = totalEmailCount > 0 ? Math.round((sentCount / totalEmailCount) * 100) : 0;

    const deptCosts: Record<string, number> = {};
    currentMonthSalaries.forEach(s => {
      const dept = s.employee?.designation || "Unknown";
      deptCosts[dept] = (deptCosts[dept] || 0) + s.netSalary;
    });
    
    const departmentCostBreakdown = Object.entries(deptCosts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    trendData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    const last6Months = trendData.slice(-6).map(t => ({
      month: `${t.month.slice(0, 3)} ${t.year}`,
      cost: t._sum.netSalary || 0
    }));

    const data = {
      totalHeadcount,
      currentMonthPayroll,
      averageSalary,
      emailSuccessRate,
      departmentCostBreakdown,
      sixMonthTrend: last6Months,
      currentMonthDisplay: `${currentMonth} ${currentYear}`,
      adminName: session.name || "Admin"
    };

    return <DashboardClient data={data} />;

  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    
    return <DashboardClient data={{
      totalHeadcount: 0,
      currentMonthPayroll: 0,
      averageSalary: 0,
      emailSuccessRate: 0,
      departmentCostBreakdown: [],
      sixMonthTrend: [],
      currentMonthDisplay: "N/A",
      adminName: "Admin"
    }} />;
  }
}
