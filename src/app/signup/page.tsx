import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/app/login/login-form";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="hero hero-compact">
      <div className="container">
        <p className="eyebrow">Sign up</p>
        <h1>Create your account.</h1>
        <p className="lead">Enter your email and we will send a link. No password to remember.</p>
        <div className="join-form">
          <AuthForm next={next && next.startsWith("/") ? next : "/app"} mode="signup" />
          <p className="lead" style={{ marginTop: "1.5rem" }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
