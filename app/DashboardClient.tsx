"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Users, IndianRupee, Mail, Banknote } from "lucide-react";

type DashboardData = {
  totalHeadcount: number;
  currentMonthPayroll: number;
  averageSalary: number;
  emailSuccessRate: number;
  departmentCostBreakdown: { name: string; value: number }[];
  sixMonthTrend: { month: string; cost: number }[];
  currentMonthDisplay: string;
  adminName?: string;
};

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

function MetricCard({ title, value, subtitle, icon: Icon, iconBg = "bg-blue-50", iconColor = "text-blue-600" }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 ${iconBg} ${iconColor} rounded-xl`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {data?.adminName || "Admin"}</h1>
            <p className="text-slate-400 mt-1 text-sm">Overview of your organization's payroll metrics and workforce data.</p>
          </div>
          <Link href="/payroll" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-blue-700 transition">
            Run Payroll
          </Link>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total Employees"
            value={data?.totalHeadcount || 0}
            subtitle="Active employees"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Payroll Cost"
            value={`₹${(data?.currentMonthPayroll || 0).toLocaleString()}`}
            subtitle={data?.currentMonthDisplay || "Current Month"}
            icon={IndianRupee}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <MetricCard
            title="Avg. Salary"
            value={`₹${Math.round(data?.averageSalary || 0).toLocaleString()}`}
            subtitle="Across all departments"
            icon={Banknote}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />
          <MetricCard
            title="Email Delivery"
            value={`${data?.emailSuccessRate || 0}%`}
            subtitle="Payslips delivered"
            icon={Mail}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">6-Month Payroll Trend</h3>
            <div className="h-[300px] w-full">
              {data?.sixMonthTrend && data.sixMonthTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                  <BarChart data={data.sixMonthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(value)} 
                      dx={-10} 
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        fontSize: '13px',
                      }}
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium">No trend data available</div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Cost by Designation</h3>
            <div className="h-[300px] w-full">
              {data?.departmentCostBreakdown && data.departmentCostBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                  <PieChart>
                    <Pie
                      data={data.departmentCostBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.departmentCostBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        fontSize: '13px',
                      }}
                      itemStyle={{ color: '#a78bfa' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium">No department data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
