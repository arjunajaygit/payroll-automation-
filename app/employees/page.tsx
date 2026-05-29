"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import Link from "next/link";

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = async () => {
    setIsLoading(true);
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onDropMaster = (acceptedFiles: File[]) => {
    Papa.parse(acceptedFiles[0], {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const response = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employees: results.data }),
        });

        if (response.ok) {
          alert("Database Updated Successfully!");
          fetchEmployees(); // Refresh the list to show new/updated employees
        } else {
          alert("Failed to update database.");
        }
      },
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropMaster, accept: { "text/csv": [".csv"] } });

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow border">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employee Directory</h1>
            <p className="text-gray-500 mt-1">Manage employee details and view payslip history.</p>
          </div>
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            Go to Run Payroll →
          </Link>
        </div>

        {/* Database Update Zone */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <h2 className="text-lg font-semibold mb-2">Update Employee Database</h2>
          <p className="text-sm text-gray-500 mb-4">Upload a new Master CSV to add new employees or update existing ones.</p>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-50 transition rounded-md">
            <input {...getInputProps()} />
            <p className="text-blue-600 font-medium">Drag & drop updated employees_master.csv here</p>
          </div>
        </div>

        {/* Employee List */}
        {isLoading ? (
          <p className="text-center text-gray-500">Loading database...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employees.map((emp) => (
              <div key={emp.employeeId} className="bg-white rounded-lg shadow border p-6">
                <div className="flex justify-between border-b pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{emp.name}</h3>
                    <p className="text-sm text-gray-500">{emp.designation} • {emp.employeeId}</p>
                    <p className="text-sm text-blue-500 mt-1">{emp.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
                      Birth Yr: {emp.birthYear}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Payslip History</h4>
                  {emp.salaries && emp.salaries.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {emp.salaries.map((salary: any) => (
                        <div key={salary.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded border">
                          <span className="font-medium text-gray-700">{salary.month} {salary.year}</span>
                          <span className="text-green-600 font-bold">₹{salary.netSalary.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No payslips generated yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}