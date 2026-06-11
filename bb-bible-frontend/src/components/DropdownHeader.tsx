'use client';

import { ReactNode } from 'react';
import BB_logo from '../../public/icons/BB-icon-152.png'
import Image from 'next/image';

interface DropdownHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
}

export default function DropdownHeader({ 
  title, 
  subtitle, 
  rightElement 
}: DropdownHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* todo : 로고 변경 필요 (텍스트 있는걸로) */}
      <div>
        <Image src={BB_logo} alt="BB Logo" width={40} height={40} />
      </div>
      
      <div className="h-[36px] flex items-center">
        {rightElement || (
          title && (
            <div className="text-right">
              <div className="font-medium text-gray-700">
                {title}
              </div>
              {subtitle && (
                <div className="text-sm text-gray-500">
                  {subtitle}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
