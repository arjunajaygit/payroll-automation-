import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { requireAuth } from "../../lib/auth";
import SalaryTableClient from "./SalaryTableClient";

const prisma = new PrismaClient();

export default async function SalaryRecordsPage() {
  
  const session = await requireAuth();
  const adminId = session.userId;

  const salaries = await prisma.salary.findMany({
    where: { adminId },
    include: {
      employee: true,
    },
    orderBy: {
      createdAt: "desc", 
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Compensation Records</h1>
            <p className="text-slate-400 mt-1 text-sm">Access and manage historical employee compensation data.</p>
          </div>
        </div>

        <SalaryTableClient initialSalaries={salaries} />
      </div>
    </div>
  );
}
