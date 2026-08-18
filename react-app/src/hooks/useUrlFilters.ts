'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Filter state that lives in the URL, applied in the browser.
 *
 * The index pages used to read searchParams on the server, which opted the
 * whole route into per-request rendering: every visit, including every crawler
 * hit, cost a function invocation and a query to render a list that is the same
 * for everybody. Reading the filter here instead lets the page itself be
 * prerendered and served from the CDN.
 *
 * The URL stays the source of truth, so a filtered view is still linkable and
 * the back button still works. Filtering no longer reloads the page.
 */
export function useUrlFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const get = useCallback((key: string) => params.get(key) ?? '', [params]);

  /** Apply several changes at once; an empty value removes the parameter. */
  const setMany = useCallback(
    (changes: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const query = next.toString();
      // replace, not push: filtering is not a navigation step a reader wants to
      // walk back through one select at a time.
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  const set = useCallback(
    (key: string, value: string) => setMany({ [key]: value }),
    [setMany]
  );

  return { get, set, setMany };
}
