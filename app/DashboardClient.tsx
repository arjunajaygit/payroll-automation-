"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

type DashboardData = {
  totalHeadcount: number;
  currentMonthPayroll: number;
  averageSalary: number;
  emailSuccessRate: number;
  departmentCostBreakdown: { name: string; value: number }[];
  sixMonthTrend: { month: string; cost: number }[];
  currentMonthDisplay: string;
};

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

function MetricCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-4 truncate">{value}</p>
      <div className="mt-4 text-sm text-gray-400 font-medium">{subtitle}</div>
    </div>
  );
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              Welcome to PayrollPro
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Here is an overview of your organization's financial and operational health.</p>
          </div>
          <Link href="/payroll" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 transition">
            Run Payroll
          </Link>
        </header>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Headcount" value={data?.totalHeadcount || 0} subtitle="Active Employees" />
          <MetricCard title="Payroll Cost" value={`₹${(data?.currentMonthPayroll || 0).toLocaleString()}`} subtitle={data?.currentMonthDisplay || "Current Month"} />
          <MetricCard title="Avg. Salary" value={`₹${Math.round(data?.averageSalary || 0).toLocaleString()}`} subtitle="Per Employee" />
          <MetricCard title="Email Delivery" value={`${data?.emailSuccessRate || 0}%`} subtitle="Success Rate" />
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* BAR CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">6-Month Payroll Trend</h3>
            <div className="h-[300px] w-full">
              {data?.sixMonthTrend && data.sixMonthTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                  <BarChart data={data.sixMonthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="cost" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No trend data available</div>
              )}
            </div>
          </div>

          {/* PIE CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Cost by Designation</h3>
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
                    <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No department data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
