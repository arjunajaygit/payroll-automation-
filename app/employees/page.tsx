"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import Link from "next/link";
import { validateEmployeeCSV } from "../../lib/csvValidation";

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error("API did not return an array:", data);
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to fetch employees", err);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const downloadEmployeeSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,employeeId,name,email,designation,birthYear\nEMP001,Arjun,arjun@example.com,Software Engineer,2003\nEMP002,Rahul,rahul@example.com,UI Designer,2002";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employees_master.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const onDropMaster = (acceptedFiles: File[], fileRejections: any[]) => {
    setErrors([]);
    
    if (fileRejections.length > 0) {
      const rejectionErrors = fileRejections.map(rejection => {
        return `File rejected: ${rejection.file.name} - ${rejection.errors.map((e: any) => e.message).join(', ')}`;
      });
      setErrors(rejectionErrors);
      return;
    }

    if (acceptedFiles.length === 0) return;

    Papa.parse(acceptedFiles[0], {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const validation = validateEmployeeCSV(results.data);
        
        if (!validation.isValid) {
          setErrors(validation.errors);
          return;
        }

        const response = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employees: validation.data }),
        });

        if (response.ok) {
          alert("Database Updated Successfully!");
          fetchEmployees(); // Refresh the list to show new/updated employees
          setErrors([]);
        } else {
          alert("Failed to update database.");
        }
      },
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop: onDropMaster, 
    accept: { "text/csv": [".csv"] },
    maxSize: 5242880 // 5MB limit
  });

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
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Update Employee Database</h2>
            <button onClick={downloadEmployeeSample} className="text-sm text-blue-600 hover:underline font-medium">Download Sample CSV</button>
          </div>
          <p className="text-sm text-gray-500 mb-4">Upload a new Master CSV to add new employees or update existing ones. Max size: 5MB.</p>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-50 transition rounded-md">
            <input {...getInputProps()} />
            <p className="text-blue-600 font-medium">Drag & drop updated employees_master.csv here</p>
          </div>
        </div>

        {/* ERRORS */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200">
            <strong className="font-semibold">Validation Errors:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

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