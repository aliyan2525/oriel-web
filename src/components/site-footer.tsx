import Link from "next/link";
import { navLinks, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-24 border-t border-lilac/60 bg-white/40">
      <div className="page-container flex flex-col gap-5 py-10 text-[0.9375rem] text-graphite md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. {site.tagline}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-indigo hover:underline underline-offset-4">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/login" className="transition-colors hover:text-indigo hover:underline underline-offset-4">
              Sign in
            </Link>
          </li>
          <li>
            <Link href="/signup" className="transition-colors hover:text-indigo hover:underline underline-offset-4">
              Sign up
            </Link>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className="transition-colors hover:text-indigo hover:underline underline-offset-4">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
