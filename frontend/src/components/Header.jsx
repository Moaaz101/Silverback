import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Lock, User, ChevronDown } from 'lucide-react';
import SilverbackLogo from '../assets/SilverbackLogo.png';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    navigate('/change-password');
  };

  return (
    <header 
      className="bg-[#391843] border-b border-[#3d2544] shadow-lg sticky top-0 z-50"
      style={{
        /* Extend header to fill notch area */
        marginTop: 'calc(-1 * env(safe-area-inset-top, 0px))',
        paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
        paddingLeft: 'max(1.5rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1.5rem, env(safe-area-inset-right, 0px))',
      }}
    >
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
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 bg-[#492e51] hover:bg-[#5a3660] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.username || 'Admin'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.username || 'Admin'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleChangePassword}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Change Password</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}