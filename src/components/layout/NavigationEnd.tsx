'use client';

import { useEffect } from 'react';
import { useNavigation } from './NavigationProvider';

/** Call endNavigation when this component mounts (e.g. after navigating to dashboard). */
export function NavigationEnd() {
  const ctx = useNavigation();
  useEffect(() => {
    ctx?.endNavigation();
  }, [ctx]);
  return null;
}
