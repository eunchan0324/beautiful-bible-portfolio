'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none transition-opacity duration-300 ease-in-out ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className="px-6 py-3 rounded-full shadow-lg backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(65, 65, 65, 0.9)', // #414141 with opacity
          color: '#ffffff',
          fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '15px',
          fontWeight: 500,
        }}
      >
        {message}
      </div>
    </div>
  );
}
