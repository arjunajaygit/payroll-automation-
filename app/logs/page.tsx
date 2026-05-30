"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Log = {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  sentAt: string;
  status: "Sent" | "Failed" | "Pending";
};

export default function EmailLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

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
    // Mock resend logic
    toast.success("Resent successfully!");
    setLogs(logs.map(log => log.id === logId ? { ...log, status: "Sent" } : log));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-lg text-gray-600">Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Logs</h1>
          <p className="text-gray-500 mt-2">Track salary slip deliveries and manage generated PDFs.</p>
        </header>

        {logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-16 text-center text-gray-500 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">No logs found</h3>
              <p className="mt-2 max-w-sm">Logs will appear here automatically once you generate and send the first batch of payroll slips.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Employee</th>
                    <th className="p-4 font-semibold text-gray-600">Sent At</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">{log.employeeName}</td>
                      <td className="p-4 text-gray-500">{new Date(log.sentAt).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === "Sent" ? "bg-green-100 text-green-800" :
                          log.status === "Failed" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 space-x-3 text-right">
                        <a 
                          href={`/api/pdf?employeeId=${log.employeeId}&month=${log.month}&year=${log.year}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Preview
                        </a>
                        <a 
                          href={`/api/pdf?employeeId=${log.employeeId}&month=${log.month}&year=${log.year}&download=true`} 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Download
                        </a>
                        {log.status === "Failed" && (
                          <button 
                            onClick={() => handleResend(log.id)}
                            className="text-red-600 hover:text-red-800 font-medium ml-3"
                          >
                            Resend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
