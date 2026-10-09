import type { Metadata } from "next";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Get early access to Oriel, the personal AI that coordinates plans with your friends' AIs.",
};

export default function JoinPage() {
  return (
    <section className="hero hero-compact">
      <div className="container">
        <p className="eyebrow">Early access</p>
        <h1>Get early access to Oriel.</h1>
        <p className="lead">Enter your email. The optional details help us choose the first groups.</p>
        <div className="join-form">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
