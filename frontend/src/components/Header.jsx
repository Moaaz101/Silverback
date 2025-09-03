import SilverbackLogo from "../assets/SilverbackLogo.png"

export default function Header() {
  return (
    <header className="bg-[#391843] border-b border-[#3d2544] shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <img 
              src={SilverbackLogo} 
              alt="Silverback Gym" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-white text-xl font-bold">Silverback</h1>
              <p className="text-purple-200 text-sm">Gym Management</p>
            </div>
          </div>
          
          {/* Optional: Could add user profile or settings here later */}
          <div className="text-purple-200">
            {/* Future: User avatar or settings */}
          </div>
        </div>
      </div>
    </header>
  )
}
