"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const empId = searchParams.get("empId");
  const period = searchParams.get("period");

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!id || !name || !empId || !period) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Verification Link</h2>
          <p className="text-slate-500 text-sm">The QR code scanned is missing required payroll verification parameters. Please ensure you are scanning a valid PayrollPro document.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
        
        {}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10"></div>

        <div className="p-8 flex flex-col items-center relative z-10">
          {}
          <div className="flex items-center gap-2 mb-8 self-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">PayrollPro</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium text-slate-500 animate-pulse">Verifying Document Authenticity...</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
              
              {}
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <svg className="w-8 h-8 animate-[bounce_0.5s_ease-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Verified Payroll</h1>
              <p className="text-sm text-emerald-600 font-semibold mb-8">Document Authenticity Confirmed</p>

              {}
              <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee Name</span>
                  <span className="text-sm font-bold text-slate-900">{name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee ID</span>
                  <span className="text-sm font-medium text-slate-700 font-mono">{empId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pay Period</span>
                  <span className="text-sm font-medium text-slate-700">{period}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slip ID</span>
                  <span className="text-xs text-slate-500 font-mono break-all text-right max-w-[150px]">{id}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-8 text-center px-4">
                This digital verification ensures that the scanned document was securely generated by the PayrollPro system and has not been tampered with.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
