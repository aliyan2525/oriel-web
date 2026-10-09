import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="hero hero-compact">
      <div className="container">
        <p className="eyebrow">Sign in</p>
        <h1>Welcome back.</h1>
        <p className="lead">We will email you a sign-in link. No password.</p>
        <div className="join-form">
          <LoginForm next={next && next.startsWith("/") ? next : "/app"} />
        </div>
      </div>
    </section>
  );
}
