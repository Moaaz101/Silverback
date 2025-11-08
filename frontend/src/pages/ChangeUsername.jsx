import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ChangeUsername() {
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { changeUsername, user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!newUsername || !password) {
      setError('All fields are required');
      return;
    }

    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
      setError('Username must be 3-20 characters (letters, numbers, underscore, hyphen only)');
      return;
    }

    if (newUsername === user?.username) {
      setError('New username must be different from current username');
      return;
    }

    setIsLoading(true);

    const result = await changeUsername(newUsername, password);

    if (result.success) {
      setSuccess(true);
      toast.success('Username changed successfully!');
      
      // Clear form
      setNewUsername('');
      setPassword('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/fighters');
      }, 2000);
    } else {
      setError(result.error);
      toast.error(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          to="/fighters"
          className="inline-flex items-center text-[#5a3660] hover:text-[#492e51] font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#492e51] to-[#5a3660] px-6 py-5 text-white">
            <h1 className="text-2xl font-bold flex items-center">
              <User className="w-6 h-6 mr-3" />
              Change Username
            </h1>
            <p className="text-sm opacity-90 mt-1">Update your admin username</p>
          </div>

          {/* Current Username Display */}
          <div className="bg-purple-50 border-b border-purple-100 px-6 py-4">
            <p className="text-sm text-gray-600">Current username:</p>
            <p className="text-lg font-semibold text-[#492e51] mt-1">{user?.username}</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-800">Success</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Username changed successfully! Redirecting...
                    </p>
                  </div>
                </div>
              )}

              {/* New Username Field */}
              <div>
                <label htmlFor="newUsername" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a3660] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter new username"
                    autoComplete="username"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  3-20 characters. Letters, numbers, underscore, and hyphen only.
                </p>
              </div>

              {/* Password Field (for confirmation) */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full pl-4 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a3660] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || success}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter your current password to confirm the change
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full bg-gradient-to-r from-[#492e51] to-[#5a3660] text-white py-3.5 rounded-lg font-semibold hover:from-[#5a3660] hover:to-[#492e51] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#492e51] disabled:hover:to-[#5a3660]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Changing Username...
                    </span>
                  ) : success ? (
                    'Username Changed ✓'
                  ) : (
                    'Change Username'
                  )}
                </button>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You'll need to enter your current password to confirm</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Your new username will be used for logging in</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You'll remain logged in after the change</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
