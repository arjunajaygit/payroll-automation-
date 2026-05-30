import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.emailLog.findMany({
    include: { employee: { include: { salaries: { take: 1, orderBy: { createdAt: 'desc' } } } } }
  });
  console.log(JSON.stringify(logs.map(log => {
    const latestSalary = log.employee.salaries[0];
    return {
      month: latestSalary ? latestSalary.month : log.sentAt.toLocaleString('default', { month: 'long' }),
      year: latestSalary ? latestSalary.year : log.sentAt.getFullYear(),
    };
  }), null, 2));
}
main().catch(console.error);
