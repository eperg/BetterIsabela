'use client';

import type { ReactNode } from 'react';
import { useMe } from '@/hooks/useMe';

/**
 * Shows `children` to a signed-in reader and `fallback` to everyone else.
 *
 * The gate is client-side so the page around it can be prerendered. It is a
 * courtesy, not a control: every server action behind it calls requireUser, so
 * revealing the form to the wrong person would still not let them write.
 */
export default function SignedIn({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { me } = useMe();
  if (me === undefined) return null;
  return <>{me ? children : fallback}</>;
}
