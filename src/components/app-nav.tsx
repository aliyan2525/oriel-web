"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Navigation link that knows when its section is open. */
export function AppNavLink({
  href,
  label,
  icon,
  variant = "side",
}: {
  href: string;
  label: string;
  icon: ReactNode;
  variant?: "side" | "tab";
}) {
  const pathname = usePathname();
  const active = href === "/app" ? pathname === "/app" || pathname.startsWith("/app/rooms") : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`nav-item nav-item--${variant}${active ? " is-active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
