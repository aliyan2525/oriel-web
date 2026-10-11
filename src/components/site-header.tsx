import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mark } from "./mark";
import { MobileNav } from "./mobile-nav";
import { navLinks, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-40 border-b border-lilac/60 bg-paper/85 backdrop-blur-xl">
      <div className="page-container flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label={`${site.name} home`}
          className="flex items-center gap-2 text-xl font-semibold tracking-[-0.03em] text-night"
        >
          <Mark size={32} />
          <span>oriel</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group relative py-1 text-[0.95rem] text-graphite transition-colors hover:text-night"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-linear-to-r from-indigo to-amber transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
