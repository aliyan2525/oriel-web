import Link from "next/link";
import { navLinks, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <p>
          © {new Date().getFullYear()} {site.name}. {site.tagline}
        </p>
        <ul className="footer-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
          <li>
            <Link href="/join">Join the waitlist</Link>
          </li>
          <li>
            <a href={`mailto:${site.email}`}>Contact</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
