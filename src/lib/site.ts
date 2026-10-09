export const site = {
  name: "Oriel",
  tagline: "Agents that meet on your terms.",
  description:
    "Oriel is a personal AI that coordinates with your friends' AIs to make plans, and asks you before anything happens.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@example.com",
} as const;

export const navLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/privacy-and-trust", label: "Trust and privacy" },
  { href: "/pricing", label: "Pricing" },
];
