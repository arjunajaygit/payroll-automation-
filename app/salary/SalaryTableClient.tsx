"use client";

import { useState, useMemo } from "react";
import PreviewAction from "./PreviewAction";

export default function SalaryTableClient({ initialSalaries }: { initialSalaries: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  // Extract unique months and years for filter dropdowns
  const months = useMemo(() => {
    const unique = Array.from(new Set(initialSalaries.map(s => s.month)));
    return ["All", ...unique];
  }, [initialSalaries]);

  const years = useMemo(() => {
    const unique = Array.from(new Set(initialSalaries.map(s => s.year)));
    return ["All", ...unique.sort().reverse()];
  }, [initialSalaries]);

  // Filter logic
  const filteredSalaries = useMemo(() => {
    return initialSalaries.filter(record => {
      const matchesSearch = 
        record.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMonth = selectedMonth === "All" || record.month === selectedMonth;
      const matchesYear = selectedYear === "All" || record.year.toString() === selectedYear.toString();

      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [initialSalaries, searchTerm, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search</label>
          <input 
            type="text" 
            placeholder="Search by Name or EMP ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Month</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Year</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Salary</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">HRA</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSalaries.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.month} {record.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    Rs. {record.baseSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                    - Rs. {record.deductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    Rs. {record.hra.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                    Rs. {record.netSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <PreviewAction employeeId={record.employeeId} month={record.month} year={record.year} />
                  </td>
                </tr>
              ))}
              {filteredSalaries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No matching salary records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
