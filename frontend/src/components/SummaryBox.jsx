export default function SummaryBox({ fighters }) {
  const totalFighters = fighters.length
  const activeFighters = fighters.filter((f) => f.sessionsLeft > 5).length
  const lowSessionsFighters = fighters.filter((f) => f.sessionsLeft <= 5 && f.sessionsLeft > 0).length
  const expiredFighters = fighters.filter((f) => f.sessionsLeft === 0).length

  const summaryStats = [
    {
      value: totalFighters,
      label: "Total Fighters",
      bgColor: "bg-[#492e51]/5",
      textColor: "text-[#492e51]"
    },
    {
      value: activeFighters,
      label: "Active",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      value: lowSessionsFighters,
      label: "Low Sessions",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      value: expiredFighters,
      label: "Expired",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    }
  ]

  if (totalFighters === 0) {
    return null
  }

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
