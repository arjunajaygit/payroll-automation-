import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { requireAuth } from "../../lib/auth";
import SalaryTableClient from "./SalaryTableClient";

const prisma = new PrismaClient();

export default async function SalaryRecordsPage() {
  // Ensure we are in a multi-tenant environment
  const session = await requireAuth();
  const adminId = session.userId;

  // Fetch salary records and include the linked employee data, scoped to the current admin
  const salaries = await prisma.salary.findMany({
    where: { adminId },
    include: {
      employee: true,
    },
    orderBy: {
      createdAt: "desc", // Show the most recently generated payslips first
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Salary Records</h1>
          <p className="text-gray-500 mt-2">View and manage historical payslips.</p>
        </header>

        <SalaryTableClient initialSalaries={salaries} />
      </div>
    </div>
  );
}
