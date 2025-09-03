export default function ErrorDisplay({ error, title = "Error" }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{title}</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
