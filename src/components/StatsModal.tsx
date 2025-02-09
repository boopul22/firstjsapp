import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UsageStats } from '@/utils/stats';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UsageStats;
}

export function StatsModal({ isOpen, onClose, stats }: StatsModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Usage Statistics
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Word Count</span>
              <span className="font-medium">{stats.wordCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Token Count</span>
              <span className="font-medium">{stats.tokenCount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Estimated Cost</span>
              <span className="font-medium">${stats.cost.toFixed(4)}</span>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 