import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function DeleteFighterModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fighterName, 
  isSubmitting 
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
    >
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Fighter?</h3>
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete {fighterName}? This action cannot be undone.
          All associated attendance and payment records will also be lost.
        </p>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
