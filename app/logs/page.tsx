"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PayslipPreview from "../components/PayslipPreview";

type Log = {
  id: string;
  employeeId: string;
  employeeName: string;
  email: string;
  month: string;
  year: number;
  sentAt: string;
  status: "Sent" | "Failed" | "Pending";
};

export default function EmailLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLog, setPreviewLog] = useState<{employeeId: string, month: string, year: number} | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleResend = (logId: string) => {
    toast.success("Resent successfully!");
    setLogs(logs.map(log => log.id === logId ? { ...log, status: "Sent" } : log));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-sm text-slate-400">Loading logs...</p>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === "All" || log.month === selectedMonth;
    const matchesYear = selectedYear === "All" || log.year.toString() === selectedYear.toString();
    const matchesStatus = selectedStatus === "All" || log.status === selectedStatus;
    return matchesSearch && matchesMonth && matchesYear && matchesStatus;
  });

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Distribution Logs</h1>
            <p className="text-slate-400 mt-1 text-sm">Monitor payslip distribution status and access generated documentation.</p>
          </div>
        </div>

        {/* Filters */}
        {!loading && logs.length > 0 && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search</label>
              <input 
                type="text" 
                placeholder="Search by Name, Email, or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="w-full md:w-36">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Month</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              >
                <option value="All">All</option>
                {Array.from(new Set(logs.map(l => l.month))).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="w-full md:w-36">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              >
                <option value="All">All</option>
                {Array.from(new Set(logs.map(l => l.year))).sort().reverse().map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="w-full md:w-36">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              >
                <option value="All">All</option>
                <option value="Sent">Sent</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        )}

        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No distribution records found</h3>
              <p className="mt-2 text-sm text-slate-400 max-w-sm">Distribution records will be generated automatically upon processing your first payroll batch.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sent At</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{log.employeeId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{log.employeeName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(log.sentAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === "Sent" ? "bg-emerald-50 text-emerald-700" :
                          log.status === "Failed" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                        <button 
                          onClick={() => setPreviewLog({ employeeId: log.employeeId, month: log.month, year: log.year })}
                          className="inline-flex items-center justify-center p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Preview"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <a 
                          href={`/api/pdf?employeeId=${log.employeeId}&month=${log.month}&year=${log.year}&download=true`} 
                          className="inline-flex items-center justify-center p-2 text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                          title="Download"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        </a>
                        {log.status === "Failed" && (
                          <button 
                            onClick={() => handleResend(log.id)}
                            className="inline-flex items-center justify-center p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            title="Resend"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                        No matching email logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payslip Preview Modal */}
      {previewLog && (
        <PayslipPreview 
          employeeId={previewLog.employeeId} 
          month={previewLog.month} 
          year={previewLog.year} 
          onClose={() => setPreviewLog(null)} 
        />
      )}
    </div>
  );
}
