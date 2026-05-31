"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import Link from "next/link";
import toast from "react-hot-toast";
import { validateEmployeeCSV } from "../../lib/csvValidation";

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [jobState, setJobState] = useState<{ active: boolean; percent: number; status: string } | null>(null);

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

        setJobState({ active: true, percent: 50, status: "Synchronizing database records..." });
        const loadingToast = toast.loading('Uploading and validating employee data...');

        const response = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employees: validation.data }),
        });

        if (response.ok) {
          setJobState({ active: false, percent: 100, status: "Completed successfully!" });
          toast.success("Employee database synchronized successfully!", { id: loadingToast });
          fetchEmployees();
          setErrors([]);
          setTimeout(() => {
             setJobState(null);
          }, 3000);
        } else {
          toast.error("Failed to synchronize database. Please verify your file format.", { id: loadingToast });
          setJobState(null);
        }
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: onDropMaster, 
    accept: { "text/csv": [".csv"] },
    maxSize: 5242880
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-sm text-slate-400">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Database</h1>
            <p className="text-slate-400 mt-1 text-sm">Manage workforce records and access historical compensation data.</p>
          </div>
          <Link href="/payroll" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-blue-700 transition">
            Run Payroll →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Synchronize Employee Database</h2>
              <p className="text-xs text-slate-400 mt-1">Upload a master CSV file to onboard personnel or update existing records. Maximum size: 5MB.</p>
            </div>
            <button onClick={downloadEmployeeSample} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition">Download Template</button>
          </div>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="text-sm text-slate-500 font-medium">{isDragActive ? "Release to upload..." : "Drag and drop your employees_master.csv file here"}</p>
              <p className="text-xs text-slate-400">or click to browse files</p>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">
            <strong className="text-sm font-semibold">Validation Errors:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {jobState && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
            <div className="flex justify-center items-center mb-4">
              {jobState.percent < 100 ? (
                <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-6 h-6 animate-[bounce_0.5s_ease-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">
              {jobState.percent < 100 ? "Updating Employee Database..." : "All Done!"}
            </h2>
            <p className="text-blue-600 font-medium text-sm">{jobState.status}</p>
            
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                style={{ width: `${Math.max(jobState.percent, 5)}%` }}
              >
                <span className="text-[10px] font-bold text-white">{jobState.percent}%</span>
              </div>
            </div>
          </div>
        )}

        {!jobState && employees.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No records found</h3>
              <p className="mt-2 text-sm text-slate-400 max-w-sm">Please upload a master CSV file to initialize the employee database.</p>
            </div>
          </div>
        ) : !jobState && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Designation</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Birth Year</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Salary</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const latestSalary = emp.salaries && emp.salaries.length > 0 ? emp.salaries[0] : null;
                    return (
                      <tr key={emp.employeeId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{emp.employeeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{emp.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{emp.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {emp.designation}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{emp.birthYear}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {latestSalary ? (
                            <div>
                              <span className="font-semibold text-emerald-600">₹{latestSalary.netSalary.toLocaleString()}</span>
                              <span className="text-slate-400 text-xs ml-1.5">{latestSalary.month} {latestSalary.year}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs italic">No payslips</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}