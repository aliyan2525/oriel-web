import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/app/login/login-form";
import { signInWithGoogle } from "@/app/login/actions";

export const metadata: Metadata = { title: "Sign up" };

const ERRORS: Record<string, string> = { google: "Google sign-in is not available right now. Try email instead." };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return (
    <section className="hero hero-compact">
      <div className="container">
        <p className="eyebrow">Sign up</p>
        <h1>Create your account.</h1>
        <p className="lead">Sign up in one tap with Google.</p>
        <div className="join-form">
          {error && ERRORS[error] && (
            <p className="form-error" role="alert">
              {ERRORS[error]}
            </p>
          )}
          <form action={signInWithGoogle} className="app-stack">
            <input type="hidden" name="next" value={safeNext} />
            <button className="button button-primary google-button" type="submit">
              Continue with Google
            </button>
          </form>
          <details className="email-fallback">
            <summary>Use email instead</summary>
            <AuthForm next={safeNext} mode="signup" />
          </details>
          <p className="lead" style={{ marginTop: "1.5rem" }}>
            <Link href="/login">Already have an account? Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
