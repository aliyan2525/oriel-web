"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavItem = { href: string; label: string };

/** Mobile navigation in a focus-trapped sheet. Closes on Escape, on backdrop tap, and on any link. */
export function MobileNav({ links }: { links: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg">
          <Menu aria-hidden="true" />
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(88vw,22rem)] gap-0 bg-paper p-0">
        <SheetHeader className="border-b border-lilac/60 p-5">
          <SheetTitle className="text-night">Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-xl px-4 py-3 text-lg text-night transition-colors hover:bg-mist"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 grid gap-3">
            <Button asChild variant="outline" size="lg">
              <Link href="/login" onClick={close}>
                Sign in
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/signup" onClick={close}>
                Sign up
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
