import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "./login-form";
import { signInWithGoogle } from "./actions";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = { google: "Google sign-in is not available right now. Try email instead." };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return (
    <section className="page-container grid min-h-[72svh] place-items-center py-20">
      <FadeIn className="w-full max-w-md">
        <Card className="rounded-3xl border-lilac/70 bg-white/85 py-0 shadow-[0_30px_60px_-40px_rgba(38,33,92,0.5)] backdrop-blur-xl">
          <CardHeader className="gap-3 px-8 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo">Sign in</p>
            <h1 className="text-[2.25rem] font-semibold leading-tight tracking-[-0.03em] text-night">Welcome back.</h1>
            <p className="text-graphite">One tap with Google. No password to remember.</p>
          </CardHeader>
          <CardContent className="grid gap-5 px-8 pb-10 pt-6">
            {error && ERRORS[error] && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {ERRORS[error]}
              </p>
            )}
            <form action={signInWithGoogle}>
              <input type="hidden" name="next" value={safeNext} />
              <Button type="submit" size="lg" className="w-full">
                Continue with Google
              </Button>
            </form>
            <details className="group rounded-2xl border border-lilac/70 bg-white/60 p-5">
              <summary className="cursor-pointer list-none font-semibold text-indigo">Use email instead</summary>
              <div className="mt-4">
                <AuthForm next={safeNext} mode="signin" />
              </div>
            </details>
            <p className="text-center">
              <Link href="/signup" className="font-semibold text-indigo underline-offset-4 hover:underline">
                New here? Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </section>
  );
}
