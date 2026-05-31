"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, FileArchive, Mail } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPayrollSummary = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading("Fetching payroll summary...");
    try {
      const res = await fetch(`/api/reports/summary?month=${selectedMonth}&year=${selectedYear}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      
      if (!data || data.length === 0) {
        toast.error("No payroll data found for this period.", { id: loadingToast });
        setIsExporting(false);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payroll Summary");
      XLSX.writeFile(wb, `Payroll_Summary_${selectedMonth}_${selectedYear}.xlsx`);
      
      toast.success("Payroll summary exported successfully!", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export payroll summary.", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportEmailLogs = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading("Fetching email logs...");
    try {
      const res = await fetch(`/api/reports/logs?month=${selectedMonth}&year=${selectedYear}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      
      if (!data || data.length === 0) {
        toast.error("No email logs found for this period.", { id: loadingToast });
        setIsExporting(false);
        return;
      }

      const formattedData = data.map((row: any) => ({
        ...row,
        "Sent At": new Date(row["Sent At"]).toLocaleString()
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Email Logs");
      XLSX.writeFile(wb, `Email_Logs_${selectedMonth}_${selectedYear}.xlsx`);
      
      toast.success("Email logs exported successfully!", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export email logs.", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadZIP = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading("Generating ZIP archive... this may take a moment.");
    try {
      const res = await fetch(`/api/reports/zip?month=${selectedMonth}&year=${selectedYear}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate ZIP");
      }

      // We get a readable stream of the ZIP file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslips_${selectedMonth}_${selectedYear}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("ZIP archive downloaded successfully!", { id: loadingToast });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to download ZIP archive.", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Export Reports</h1>
          <p className="text-slate-500 text-sm">Download your payroll data, email distribution logs, and generated payslips.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Select Period</h2>
          <div className="flex gap-4">
            <div className="w-48">
              <label className="block text-xs font-semibold text-slate-400 mb-2">Month</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={isExporting}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-xs font-semibold text-slate-400 mb-2">Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={isExporting}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Payroll Summary</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">Export a complete breakdown of earnings and deductions for all employees.</p>
            <button 
              onClick={handleExportPayrollSummary}
              disabled={isExporting}
              className="w-full py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Email Logs</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">Export the delivery status of all distributed payslips for your records.</p>
            <button 
              onClick={handleExportEmailLogs}
              disabled={isExporting}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-4">
              <FileArchive className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Payslips Archive</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">Download a ZIP file containing all password-protected PDF payslips.</p>
            <button 
              onClick={handleDownloadZIP}
              disabled={isExporting}
              className="w-full py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download ZIP
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
