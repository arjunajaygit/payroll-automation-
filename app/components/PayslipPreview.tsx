"use client";

export default function PayslipPreview({ employeeId, month, year, onClose, hideDownload = false }: { employeeId: string, month: string, year: number, onClose: () => void, hideDownload?: boolean }) {
  // Construct the URL with preview=true so it bypasses the password lock, and #toolbar=0 to hide download buttons
  const pdfUrl = `/api/pdf?employeeId=${employeeId}&month=${month}&year=${year}&preview=true#toolbar=0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden transform scale-100 transition-transform">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Payslip Preview</h3>
              <p className="text-xs text-gray-500 font-medium">Viewing payslip copy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Real Secure Download Button */}
            {!hideDownload && (
              <a 
                href={`/api/pdf?employeeId=${employeeId}&month=${month}&year=${year}&download=true`}
                download
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition hover:shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Secure PDF
              </a>
            )}
            <button 
              onClick={onClose}
              className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* PDF Iframe */}
        <div className="flex-1 bg-gray-100/50 p-6">
          <iframe 
            src={pdfUrl} 
            className="w-full h-full rounded-xl shadow-inner border border-gray-200 bg-white"
            title="PDF Preview"
          />
        </div>

      </div>
    </div>
  );
}
