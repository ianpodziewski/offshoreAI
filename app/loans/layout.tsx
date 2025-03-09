// app/loans/layout.tsx
import React from 'react';
import LayoutWrapper from '../layout-wrapper';

export default function LoansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}