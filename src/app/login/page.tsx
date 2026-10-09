import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="hero hero-compact">
      <div className="container">
        <p className="eyebrow">Sign in</p>
        <h1>Welcome back.</h1>
        <p className="lead">We will email you a sign-in link. No password.</p>
        <div className="join-form">
          <AuthForm next={next && next.startsWith("/") ? next : "/app"} mode="signin" />
          <p className="lead" style={{ marginTop: "1.5rem" }}>
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
