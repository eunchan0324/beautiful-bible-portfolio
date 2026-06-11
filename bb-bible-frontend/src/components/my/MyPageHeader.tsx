'use client';

import type { ReactNode } from 'react';
import PageHeader from '@/components/PageHeader';

interface MyPageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

export default function MyPageHeader({ title, showBack = false, rightAction }: MyPageHeaderProps) {
  return (
    <PageHeader
      title={title}
      align={showBack ? 'center' : 'left'}
      showBack={showBack}
      rightAction={rightAction}
    />
  );
}
