'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SignOutButton } from './SignOutButton';
import { Button } from '@/components/ui/button';

const navLinkClass =
  "relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 rounded-lg px-3 py-2.5 after:content-[''] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-px after:bg-brand after:scale-x-0 after:transition-transform after:duration-300 after:origin-center hover:after:scale-x-100";

const mobileLinkClass =
  "flex min-h-[44px] items-center rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-section-alt transition-colors";

export interface HeaderNavProps {
  hasUser: boolean;
  isVendor: boolean;
  isAdmin: boolean;
}

export function HeaderNav({ hasUser, isVendor, isAdmin }: HeaderNavProps) {
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
      <Link href="/venues" className={navLinkClass} onClick={() => setOpen(false)}>
        Venues
      </Link>
      <Link href="/compare" className={navLinkClass} onClick={() => setOpen(false)}>
        Compare
      </Link>
      {hasUser ? (
        <>
          {isAdmin ? (
            <Link href="/admin" className={navLinkClass} onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : isVendor ? (
            <Link href="/vendor/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <Link href="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          )}
          <span className="[&_button]:min-h-[44px] [&_button]:min-w-[44px] [&_button]:flex [&_button]:items-center [&_button]:justify-center">
            <SignOutButton />
          </span>
        </>
      ) : (
        <>
          <Link href="/login" className={navLinkClass} onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-sm bg-ink px-6 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-[var(--page-bg)] shadow-[var(--shadow-soft)] transition-all duration-200 hover:bg-brand-hover hover:-translate-y-px min-h-[44px] inline-flex items-center justify-center"
            onClick={() => setOpen(false)}
          >
            Register
          </Link>
        </>
      )}
    </>
  );

  const mobileNavLinks = (
    <nav className="flex flex-col gap-1 px-4 pb-6" aria-label="Main">
      <Link href="/venues" className={mobileLinkClass} onClick={() => setOpen(false)}>
        Venues
      </Link>
      <Link href="/compare" className={mobileLinkClass} onClick={() => setOpen(false)}>
        Compare
      </Link>
      {hasUser ? (
        <>
          {isAdmin ? (
            <Link href="/admin" className={mobileLinkClass} onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : isVendor ? (
            <Link href="/vendor/dashboard" className={mobileLinkClass} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <Link href="/dashboard" className={mobileLinkClass} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          )}
          <div className="min-h-[44px] flex items-center px-4">
            <SignOutButton />
          </div>
        </>
      ) : (
        <>
          <Link href="/login" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link
            href="/register"
            className={mobileLinkClass}
            onClick={() => setOpen(false)}
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop nav: visible from md up */}
      <nav className="hidden md:flex items-center gap-6 sm:gap-8" aria-label="Main">
        {navLinks}
      </nav>
      {/* Mobile: hamburger + Sheet */}
      <div className="flex md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg text-foreground hover:bg-section-alt"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-[min(20rem,100vw)] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b border-border text-left">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">{mobileNavLinks}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
