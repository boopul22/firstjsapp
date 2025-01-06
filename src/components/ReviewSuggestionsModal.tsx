'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReviewSuggestions } from './ReviewSuggestions';

interface ReviewSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: {
    correctness: number;
    clarity: number;
    engagement: number;
    delivery: number;
  };
  seo?: {
    score: number;
    suggestions: string[];
  };
  analysis?: string;
}

export function ReviewSuggestionsModal({
  isOpen,
  onClose,
  suggestions,
  seo,
  analysis,
}: ReviewSuggestionsModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-1">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-5xl transform overflow-hidden rounded-md bg-white p-2 shadow-md transition-all">
                <button
                  onClick={onClose}
                  className="absolute right-1 top-1 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                
                <div className="space-y-2">
                  <ReviewSuggestions
                    suggestions={suggestions}
                    seo={seo}
                    analysis={analysis}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 