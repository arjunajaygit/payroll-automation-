"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { LayoutDashboard, Users, CreditCard, Receipt, FileText, LogOut, Download } from "lucide-react";
import AccessibilityModal from "./AccessibilityModal";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Run Payroll", href: "/payroll", icon: CreditCard },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Salary Records", href: "/salary", icon: Receipt },
  { name: "Email Logs", href: "/logs", icon: FileText },
  { name: "Reports", href: "/reports", icon: Download },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showAccessibility, setShowAccessibility] = useState(false);

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 flex flex-col h-screen fixed left-0 top-0 border-r border-indigo-500/20 shadow-xl z-50">
      <div className="p-6 flex items-center gap-2 border-b border-white/10">
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-extrabold text-2xl text-white tracking-tight">PayrollPro</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  
                  ? "bg-white/10 border border-white/20 text-white shadow-lg"
                  
                  : "text-blue-200 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-blue-300"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 bg-black/10 flex flex-col gap-2">
        <button
          onClick={() => setShowAccessibility(true)}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-blue-200 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Accessibility
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-all duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {showAccessibility && <AccessibilityModal onClose={() => setShowAccessibility(false)} />}
    </aside>
  );
}
