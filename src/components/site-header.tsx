import Link from "next/link";
import { Mark } from "./mark";
import { navLinks, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link href="/" className="logo" aria-label={`${site.name} home`}>
          <Mark size={32} />
          <span>oriel</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-actions">
          <Link href="/join" className="button button-primary">
            Join the waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
