'use client';

import { useNavigation } from './NavigationProvider';
import { MainContentLoader } from './MainContentLoader';

export function MainWithLoader({ children }: { children: React.ReactNode }) {
  const ctx = useNavigation();
  const isNavigating = ctx?.isNavigating ?? false;

  return (
    <main className="flex-1 relative flex min-h-[calc(100vh-4rem)] flex-col">
      {children}
      {isNavigating && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-[2px] pt-16"
          aria-live="polite"
          aria-busy="true"
        >
          <MainContentLoader />
        </div>
      )}
    </main>
  );
}
