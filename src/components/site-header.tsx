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

        <nav aria-label="Primary" className="nav-desktop">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-actions">
          <Link href="/login" className="button button-secondary">
            Sign in
          </Link>
          <Link href="/signup" className="button button-primary">
            Sign up
          </Link>
        </div>

        <details className="menu">
          <summary className="menu-toggle">Menu</summary>
          <nav aria-label="Mobile" className="menu-panel">
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/login">Sign in</Link>
              </li>
              <li className="menu-cta">
                <Link href="/signup">Sign up</Link>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
