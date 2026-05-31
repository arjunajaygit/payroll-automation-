"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LayoutDashboard, Users, CreditCard, Receipt, FileText, LogOut, Download, Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center gap-2 border-b border-white/10">
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-extrabold text-2xl text-white tracking-tight">PayrollPro</span>
        {/* Close button visible only on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden ml-auto p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
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
    </>
  );

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 border-b border-indigo-500/20 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-extrabold text-lg text-white tracking-tight">PayrollPro</span>
          </div>
          {/* Spacer to center the logo */}
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 flex flex-col border-r border-indigo-500/20 shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar (unchanged) */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 flex-col h-screen fixed left-0 top-0 border-r border-indigo-500/20 shadow-xl z-50">
        {sidebarContent}
      </aside>

      {showAccessibility && <AccessibilityModal onClose={() => setShowAccessibility(false)} />}
    </>
  );
}
