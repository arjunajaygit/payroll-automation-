"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TopNav() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-bold text-xl tracking-tight">PayrollPro</span>
      </div>
      <div className="space-x-6 text-sm font-medium flex items-center">
        <Link href="/" className="hover:text-blue-400 transition">Dashboard</Link>
        <Link href="/payroll" className="hover:text-blue-400 transition">Run Payroll</Link>
        <Link href="/employees" className="hover:text-blue-400 transition">Employees</Link>
        <Link href="/salary" className="hover:text-blue-400 transition">Salary Records</Link>
        <Link href="/logs" className="hover:text-blue-400 transition">Email Logs</Link>
        <button 
          onClick={handleLogout} 
          className="ml-4 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
