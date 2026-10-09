import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "./login-form";
import { signInWithGoogle } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = { google: "Google sign-in is not available right now. Try email instead." };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return (
    <section className="hero hero-compact">
      <div className="container">
        <p className="eyebrow">Sign in</p>
        <h1>Welcome back.</h1>
        <p className="lead">One tap with Google. No password to remember.</p>
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
            <AuthForm next={safeNext} mode="signin" />
          </details>
          <p className="lead" style={{ marginTop: "1.5rem" }}>
            <Link href="/signup">New here? Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
