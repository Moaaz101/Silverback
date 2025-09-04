import { Edit, Trash2 } from 'lucide-react';

export default function FighterSettings({ onEditClick, onDeleteClick }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Fighter Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Fighter Card */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-[#492e51]/10 rounded-full flex items-center justify-center mr-4">
              <Edit className="w-5 h-5 text-[#492e51]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Edit Fighter Information</h3>
              <p className="text-gray-600 text-sm">Update details and subscription information</p>
            </div>
          </div>
          <button
            onClick={onEditClick}
            className="w-full mt-2 px-4 py-2 bg-[#492e51] text-white rounded-lg hover:bg-[#5a3660] transition-colors"
          >
            Edit Fighter
          </button>
        </div>
        
        {/* Delete Fighter Card */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mr-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Delete Fighter</h3>
              <p className="text-gray-600 text-sm">Permanently remove this fighter from the system</p>
            </div>
          </div>
          <button
            onClick={onDeleteClick}
            className="w-full mt-2 px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete Fighter
          </button>
        </div>
      </div>
    </div>
  );
}
