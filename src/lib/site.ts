export const site = {
  name: "Oriel",
  tagline: "Agents that meet on your terms.",
  description:
    "Oriel is a personal AI that coordinates with your friends' AIs to make plans, and asks you before anything happens.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oriel-app.vercel.app",
  email: "hello@example.com",
} as const;

export const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/privacy-and-trust", label: "Trust and privacy" },
  { href: "/pricing", label: "Pricing" },
];
