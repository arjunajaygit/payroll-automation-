"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { validateSalaryCSV } from "../../lib/csvValidation";

// Type Definitions based on your exact schema
type EmployeeRecord = {
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  birthYear: number;
};

type MergedPayroll = EmployeeRecord & {
  baseSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  month: string;
  year: number;
  netSalary: number;
};

export default function Dashboard() {
  const [employeeDB, setEmployeeDB] = useState<EmployeeRecord[]>([]);
  const [payroll, setPayroll] = useState<MergedPayroll[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobState, setJobState] = useState<{ active: boolean; percent: number; status: string } | null>(null);

  useEffect(() => {
    // Automatically load the employee database on mount
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployeeDB(data);
        // Only proceed to step 2 if the database is actually populated
        if (data && data.length > 0) {
          setStep(2); 
        } else {
          setStep(1);
        }
        setIsLoading(false);
      });
  }, []);

  // CSV Download Helpers
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

  const downloadSalarySample = () => {
    const csvContent = "data:text/csv;charset=utf-8,employeeId,baseSalary,hra,allowances,deductions,month,year\nEMP001,50000,10000,5000,2000,May,2026\nEMP002,45000,8000,3000,1000,May,2026";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "salary_may_2026.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Upload Handlers

  const onDropSalary = (acceptedFiles: File[], fileRejections: any[]) => {
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
      complete: (results) => {
        const validation = validateSalaryCSV(results.data, employeeDB);

        if (!validation.isValid) {
          setErrors(validation.errors);
          setPayroll([]);
          return;
        }

        setPayroll(validation.data as MergedPayroll[]);
      },
    });
  };

  const handleGenerateAndSend = async () => {
    setIsProcessing(true);
    setJobState({ active: true, percent: 50, status: "Processing payroll documents..." });
    const loadingToast = toast.loading('Generating PDFs and dispatching emails...');
    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payrollData: payroll }),
      });

      if (!response.ok) {
        toast.error('Failed to process payroll.', { id: loadingToast });
        setIsProcessing(false);
        setJobState(null);
        return;
      }

      await response.json();

      setJobState({ active: false, percent: 100, status: "Completed successfully! ✅" });
      toast.success("All payroll documents sent successfully!", { id: loadingToast });
      setTimeout(() => {
         setPayroll([]);
         setJobState(null);
         setIsProcessing(false);
      }, 3000);

    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred.', { id: loadingToast });
      setIsProcessing(false);
      setJobState(null);
    }
  };

  // master upload moved to Employee Directory; only keep salary dropzone here
  const dropzoneSalary = useDropzone({ 
    onDrop: onDropSalary, 
    accept: { "text/csv": [".csv"] },
    maxSize: 5242880 // 5MB limit
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-sm text-slate-400">Checking database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Process Payroll</h1>
            <p className="text-slate-400 mt-1 text-sm">Upload monthly compensation data to generate and distribute payslips.</p>
          </div>
          {payroll.length > 0 && (
            <button 
              onClick={() => { setPayroll([]); setErrors([]); }} 
              className="text-xs text-slate-400 font-medium hover:text-slate-600 transition"
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Master DB Status */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          {employeeDB.length > 0 ? (
            <div className="flex justify-between items-center">
              <p className="text-emerald-600 font-medium text-sm">✅ Master Database Synchronized ({employeeDB.length} active records)</p>
              <Link href="/employees" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition">Manage Records</Link>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-red-500 font-medium text-sm">Employee database is currently empty.</p>
              <Link href="/employees" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition">Upload Records</Link>
            </div>
          )}
        </div>

        

        {/* STEP 1: Empty State */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Payroll Processing Initialization</h2>
            <p className="text-sm text-slate-400 max-w-md">
              The employee database is currently empty. Please synchronize your workforce records before processing payroll.
            </p>
            <Link href="/employees" className="mt-2 inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-blue-700 transition">
              Access Employee Database
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        )}

        {/* STEP 2: Salary Upload */}
        {step === 2 && (
          <div className={`p-6 bg-white rounded-2xl shadow-sm border ${payroll.length > 0 ? 'border-slate-200' : 'border-slate-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className={`font-semibold ${payroll.length > 0 ? 'text-sm text-slate-500' : 'text-sm text-slate-700'}`}>
                  {payroll.length > 0 ? "Update Monthly Compensation Data" : "Upload Compensation Data"}
                </h2>
              </div>
              {payroll.length === 0 && (
                <button onClick={downloadSalarySample} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition">Download Template</button>
              )}
            </div>
            
            <div {...dropzoneSalary.getRootProps()} className={`border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${payroll.length > 0 ? 'p-4 border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100' : 'p-8 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <input {...dropzoneSalary.getInputProps()} />
              <p className="text-sm">{payroll.length > 0 ? "Drag and drop an updated salary CSV file here to overwrite current data" : "Drag and drop your monthly salary CSV file here"}</p>
            </div>
          </div>
        )}

        {/* ERRORS */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">
            <strong className="text-sm font-semibold">Validation Errors:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* PROGRESS BAR */}
        {jobState && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
            <div className="flex justify-center items-center mb-4">
              {jobState.percent < 100 ? (
                <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">
              {jobState.percent < 100 ? "Processing Payroll Queue..." : "All Done!"}
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

        {!jobState && payroll.length > 0 && (
           <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
               <div>
                 <h2 className="text-sm font-semibold text-slate-700">Payroll Processing Preview</h2>
                 <p className="text-xs text-slate-400 mt-0.5">Verify compensation details before authorizing the generation of {payroll.length} payslips.</p>
               </div>
               <button 
                 onClick={handleGenerateAndSend} 
                 className={`text-white text-sm px-5 py-2.5 rounded-xl shadow-sm transition font-medium ${(isProcessing || errors.length > 0) ? 'opacity-60 cursor-not-allowed bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                 disabled={isProcessing || errors.length > 0}
               >
                 {isProcessing ? "Processing..." : "Authorize & Distribute Payslips"}
               </button>
             </div>
             
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-slate-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Period</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Base</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">HRA</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Allowances</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Deductions</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Salary</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {payroll.map((emp, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 text-sm font-mono text-slate-500">{emp.employeeId}</td>
                       <td className="px-6 py-4">
                         <div className="text-sm font-medium text-slate-900">{emp.name}</div>
                         <div className="text-xs text-slate-400">{emp.designation} · {emp.email}</div>
                       </td>
                       <td className="px-6 py-4 text-sm text-slate-500">{emp.month} {emp.year}</td>
                       <td className="px-6 py-4 text-sm text-slate-900 text-right">₹{emp.baseSalary.toLocaleString()}</td>
                       <td className="px-6 py-4 text-sm text-slate-900 text-right">₹{emp.hra.toLocaleString()}</td>
                       <td className="px-6 py-4 text-sm text-slate-900 text-right">₹{emp.allowances.toLocaleString()}</td>
                       <td className="px-6 py-4 text-sm text-red-500 text-right">-₹{emp.deductions.toLocaleString()}</td>
                       <td className="px-6 py-4 text-sm font-semibold text-emerald-600 text-right">₹{emp.netSalary.toLocaleString()}</td>
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