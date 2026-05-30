"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, IndianRupee, Mail, Banknote } from "lucide-react";

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

function MetricCard({ title, value, subtitle, trend, trendUp, icon: Icon }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        {trend && (
          <span className={`flex items-center font-medium ${trendUp ? "text-emerald-600" : "text-red-600"}`}>
            {trendUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            {trend}
          </span>
        )}
        <span className="text-slate-400">{subtitle}</span>
      </div>
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
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hello, {data?.adminName || "Admin"} 👋</h1>
            <p className="text-gray-500 mt-1 text-sm">Welcome back to your payroll command center.</p>
          </div>
          <Link href="/payroll" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 transition">
            Run Payroll
          </Link>
        </header>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Headcount" 
            value={data?.totalHeadcount || 0} 
            subtitle="vs last month" 
            trend="2.4%" 
            trendUp={true} 
            icon={Users} 
          />
          <MetricCard 
            title="Payroll Cost" 
            value={`₹${(data?.currentMonthPayroll || 0).toLocaleString()}`} 
            subtitle={data?.currentMonthDisplay || "Current Month"} 
            icon={IndianRupee} 
          />
          <MetricCard 
            title="Avg. Salary" 
            value={`₹${Math.round(data?.averageSalary || 0).toLocaleString()}`} 
            subtitle="Across all departments" 
            icon={Banknote} 
          />
          <MetricCard 
            title="Email Delivery" 
            value={`${data?.emailSuccessRate || 0}%`} 
            subtitle="Payslips delivered" 
            trend="100%" 
            trendUp={true} 
            icon={Mail} 
          />
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
                    {/* Add a subtle dashed grid */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} dx={-10} />
                    
                    {/* Modern Tooltip Styling */}
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc'
                      }} 
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    
                    {/* Rounded top corners on bars */}
                    <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
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
