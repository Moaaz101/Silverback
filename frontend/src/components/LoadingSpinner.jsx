import SilverbackLogo from "../assets/SilverbackLogo.png"

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="mb-6">
            <img 
              src={SilverbackLogo} 
              alt="Silverback Gym" 
              className="h-16 w-auto mx-auto opacity-80"
            />
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#492e51]"></div>
          <p className="mt-4 text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  )
}
