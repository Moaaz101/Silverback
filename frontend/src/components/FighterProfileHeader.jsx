import { User, Phone, Clock, Calendar } from 'lucide-react';

export default function FighterProfileHeader({ fighter }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-[#492e51] to-[#5a3660] px-6 py-4 text-white">
        <h1 className="text-2xl font-bold">{fighter.name}</h1>
      </div>
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center">
          <User size={20} className="text-gray-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Coach</p>
            <p className="font-medium">{fighter.coach?.name || 'Unassigned'}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Phone size={20} className="text-gray-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{fighter.phone || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Clock size={20} className="text-gray-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Sessions Left</p>
            <p className="font-medium">{fighter.sessionsLeft}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Calendar size={20} className="text-gray-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium">{new Date(fighter.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
