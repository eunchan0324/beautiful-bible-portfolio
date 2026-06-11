'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BottomNavigation from './BottomNavigation';

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  const [isSearchInputActive, setIsSearchInputActive] = useState(false);
  const isChapterPage = /^\/bible\/[^\/]+\/\d+$/.test(pathname);

  useEffect(() => {
    if (pathname !== '/search') {
      setIsSearchInputActive(false);
      return;
    }

    const isMobileLike = () =>
      window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;

    const isEditableElement = (element: Element | null) =>
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement ||
      element?.getAttribute('contenteditable') === 'true';

    const updateInputState = () => {
      setIsSearchInputActive(isMobileLike() && isEditableElement(document.activeElement));
    };

    const handleFocusOut = () => {
      window.setTimeout(updateInputState, 0);
    };

    updateInputState();
    window.addEventListener('focusin', updateInputState);
    window.addEventListener('focusout', handleFocusOut);
    window.addEventListener('resize', updateInputState);
    window.visualViewport?.addEventListener('resize', updateInputState);

    return () => {
      window.removeEventListener('focusin', updateInputState);
      window.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('resize', updateInputState);
      window.visualViewport?.removeEventListener('resize', updateInputState);
    };
  }, [pathname]);

  if (isChapterPage || isSearchInputActive) return null;
  return <BottomNavigation />;
}
