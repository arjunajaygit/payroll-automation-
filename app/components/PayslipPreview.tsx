"use client";

export default function PayslipPreview({
  employeeId,
  month,
  year,
  onClose,
  hideDownload = false,
}: {
  employeeId: string;
  month: string;
  year: number;
  onClose: () => void;
  hideDownload?: boolean;
}) {
  const pdfUrl = `/api/pdf?employeeId=${employeeId}&month=${month}&year=${year}&preview=true#toolbar=0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[92vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-row items-center space-x-3">
            {/* PayrollPro Logo mark */}
            <div className="flex-none w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
              P
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-none mb-1">Payslip Preview</h3>
              <p className="text-sm text-slate-500 leading-none">{month} {year} · Verified Payroll Document</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!hideDownload && (
              <a
                href={`/api/pdf?employeeId=${employeeId}&month=${month}&year=${year}&download=true`}
                download
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Secure PDF
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Iframe */}
        <div className="flex-1 bg-slate-100 p-5">
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-xl shadow-sm border border-slate-200 bg-white"
            title="Payslip Preview"
          />
        </div>

      </div>
    </div>
  );
}
