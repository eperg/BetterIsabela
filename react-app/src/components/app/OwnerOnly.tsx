'use client';

import type { ReactNode } from 'react';
import { useMe } from '@/hooks/useMe';

/**
 * Shows `children` only to the reader who owns the row.
 *
 * As with SignedIn, this decides what is worth offering, not what is allowed:
 * the action itself re-checks ownership server-side before writing.
 */
export default function OwnerOnly({
  ownerId,
  children,
}: {
  ownerId: number | null;
  children: ReactNode;
}) {
  const { me } = useMe();
  if (me === undefined || ownerId === null) return null;
  return <>{me?.id === ownerId ? children : null}</>;
}
