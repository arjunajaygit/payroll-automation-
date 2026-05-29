"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

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

  useEffect(() => {
    // Automatically load the employee database on mount
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployeeDB(data);
        setStep(2); // Skip straight to step 2 (Salary Upload)
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

  const onDropSalary = (acceptedFiles: File[]) => {
    setErrors([]);
    Papa.parse(acceptedFiles[0], {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mergedData: MergedPayroll[] = [];
        const newErrors: string[] = [];

        results.data.forEach((salaryRow: any) => {
          const dbRecord = employeeDB.find((emp) => emp.employeeId === salaryRow.employeeId);

          if (dbRecord) {
            mergedData.push({
              ...dbRecord,
              baseSalary: salaryRow.baseSalary,
              hra: salaryRow.hra,
              allowances: salaryRow.allowances,
              deductions: salaryRow.deductions,
              month: salaryRow.month,
              year: salaryRow.year,
              netSalary: (salaryRow.baseSalary + salaryRow.hra + salaryRow.allowances) - salaryRow.deductions,
            });
          } else {
            newErrors.push(`ID ${salaryRow.employeeId} not found in Master Database.`);
          }
        });

        setPayroll(mergedData);
        if (newErrors.length > 0) setErrors(newErrors);
      },
    });
  };

  const handleGenerateAndSend = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payrollData: payroll }),
      });

      if (response.ok) {
        alert("Success! Check your VS Code terminal to see the backend logs.");
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // master upload moved to Employee Directory; only keep salary dropzone here
  const dropzoneSalary = useDropzone({ onDrop: onDropSalary, accept: { "text/csv": [".csv"] } });

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header with Reset Button */}
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-bold">Smart Payroll Automation</h1>
          {payroll.length > 0 && (
            <button 
              onClick={() => { setEmployeeDB([]); setPayroll([]); setStep(2); setErrors([]); }} 
              className="text-sm text-red-500 font-medium hover:underline transition"
            >
              Reset All Data
            </button>
          )}
        </div>

        {/* Master DB Status */}
        <div className="bg-white p-4 rounded-lg shadow border">
          {employeeDB.length > 0 ? (
            <div className="flex justify-between items-center">
              <p className="text-green-600 font-medium">✅ Master Database Loaded ({employeeDB.length} employees)</p>
              <Link href="/employees" className="text-sm text-blue-600 hover:underline">Manage Employees</Link>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-red-600 font-medium">No Master Database detected.</p>
              <Link href="/employees" className="text-sm text-blue-600 hover:underline">Upload Master CSV</Link>
            </div>
          )}
        </div>

        

        {/* STEP 2: Salary Upload */}
        {step === 2 && (
          <div className={`p-6 bg-white rounded-lg shadow border-l-4 ${payroll.length > 0 ? 'border-gray-300' : 'border-blue-600'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`font-semibold ${payroll.length > 0 ? 'text-lg text-gray-600' : 'text-xl'}`}>
                {payroll.length > 0 ? "Need to modify this month's salary data?" : "Step 2: Upload Monthly Salary"}
              </h2>
              {payroll.length === 0 && (
                <button onClick={downloadSalarySample} className="text-sm text-blue-600 hover:underline">Download Sample CSV</button>
              )}
            </div>
            
            <div {...dropzoneSalary.getRootProps()} className={`border-2 border-dashed text-center cursor-pointer transition ${payroll.length > 0 ? 'p-4 border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100' : 'p-8 border-gray-300 hover:bg-gray-50'}`}>
              <input {...dropzoneSalary.getInputProps()} />
              <p>{payroll.length > 0 ? "Drag & drop a new salary_month.csv here to overwrite the table below" : "Drag & drop the salary_month.csv here"}</p>
            </div>
          </div>
        )}

        {/* ERRORS */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200">
            <strong className="font-semibold">Validation Errors:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* PREVIEW TABLE */}
        {payroll.length > 0 && (
           <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
             <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
               <div>
                 <h2 className="font-semibold text-lg text-gray-800">Final Payroll Preview</h2>
                 <p className="text-sm text-gray-500">Review all details before generating {payroll.length} salary slips.</p>
               </div>
               <button onClick={handleGenerateAndSend} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed" disabled={isProcessing}>
                 {isProcessing ? "Processing..." : "Generate PDFs & Send Emails"}
               </button>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-gray-50 border-b">
                   <tr>
                     <th className="p-4 font-semibold text-gray-600">ID</th>
                     <th className="p-4 font-semibold text-gray-600">Employee Details</th>
                     <th className="p-4 font-semibold text-gray-600">Period</th>
                     <th className="p-4 font-semibold text-gray-600">Base</th>
                     <th className="p-4 font-semibold text-gray-600">HRA</th>
                     <th className="p-4 font-semibold text-gray-600">Allowances</th>
                     <th className="p-4 font-semibold text-gray-600">Deductions</th>
                     <th className="p-4 font-bold text-blue-600">Net Salary</th>
                   </tr>
                 </thead>
                 <tbody>
                   {payroll.map((emp, i) => (
                     <tr key={i} className="border-b hover:bg-gray-50 transition">
                       <td className="p-4 text-gray-600">{emp.employeeId}</td>
                       <td className="p-4">
                         <div className="font-medium text-gray-900">{emp.name}</div>
                         <div className="text-xs text-gray-500">{emp.designation}</div>
                         <div className="text-xs text-blue-500">{emp.email}</div>
                       </td>
                       <td className="p-4 text-gray-600">{emp.month} {emp.year}</td>
                       <td className="p-4">₹{emp.baseSalary}</td>
                       <td className="p-4">₹{emp.hra}</td>
                       <td className="p-4">₹{emp.allowances}</td>
                       <td className="p-4 text-red-500">-₹{emp.deductions}</td>
                       <td className="p-4 font-bold text-green-600 bg-green-50/30">₹{emp.netSalary}</td>
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