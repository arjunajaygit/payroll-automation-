"use client";

import { useState } from "react";
import PayslipPreview from "../components/PayslipPreview";

export default function PreviewAction({ employeeId, month, year }: { employeeId: string, month: string, year: number }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="inline-flex items-center justify-center p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
        title="View Payslip Preview"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {showPreview && (
        <PayslipPreview
          employeeId={employeeId}
          month={month}
          year={year}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
