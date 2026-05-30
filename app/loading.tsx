export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
