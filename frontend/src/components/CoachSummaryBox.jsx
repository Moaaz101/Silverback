export default function CoachSummaryBox({ coaches }) {
  const totalCoaches = coaches.length
  const totalFighters = coaches.reduce((sum, coach) => sum + (coach.fighters?.length || 0), 0)

  const summaryStats = [
    {
      value: totalCoaches,
      label: "Total Coaches",
      bgColor: "bg-[#492e51]/5",
      textColor: "text-[#492e51]"
    },
    {
      value: totalFighters,
      label: "Total Fighters",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    }
  ]

  if (totalCoaches === 0) {
    return null
  }

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {summaryStats.map((stat, index) => (
          <div key={index} className={`text-center p-4 ${stat.bgColor} rounded-xl`}>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
