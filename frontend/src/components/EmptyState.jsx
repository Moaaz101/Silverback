import { User } from "lucide-react"
import SilverbackLogo from "../assets/SilverbackLogo.png"

export default function EmptyState({ 
  icon: Icon = User, 
  title = "No data found", 
  description = "There is currently no data to display." 
}) {
  return (
    <div className="text-center py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
        <div className="mb-6">
          <img 
            src={SilverbackLogo} 
            alt="Silverback Gym" 
            className="h-12 w-auto mx-auto opacity-60"
          />
        </div>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  )
}
