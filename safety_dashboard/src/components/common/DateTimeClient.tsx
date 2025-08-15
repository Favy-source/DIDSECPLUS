"use client";

import React, { useEffect, useState } from 'react';

type Props = { iso: string };

// Render ISO initially (stable for SSR) then replace with localized format on mount
export default function DateTimeClient({ iso }: Props) {
  const [display, setDisplay] = useState<string>(iso || '');

  useEffect(() => {
    let mounted = true;
    try {
      const formatted = new Date(iso).toLocaleString();
      if (mounted) setDisplay(formatted);
    } catch (e) {
      // ignore and keep ISO
    }
    return () => { mounted = false; };
  }, [iso]);

  return <>{display}</>;
}
