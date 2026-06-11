'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function BackHeader({ title, subtitle, onBack }: BackHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center space-x-3 mb-6">
      <button
        onClick={handleBack}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft size={24} className="text-gray-600" />
      </button>
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
