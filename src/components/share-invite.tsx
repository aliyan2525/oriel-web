"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/** Retention loop: a waitlist member invites a friend, using the native share sheet when available. */
export function ShareInvite() {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  async function invite() {
    const url = `${site.url}/join`;
    const text = "I just joined the Oriel waitlist. Join me:";
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: site.name, text, url });
        setStatus("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setStatus("copied");
      }
    } catch {
      // The share sheet was dismissed, or the clipboard is unavailable. Nothing to recover.
    }
  }

  return (
    <button type="button" className="button button-secondary" onClick={invite}>
      {status === "copied" ? "Link copied" : status === "shared" ? "Thanks for sharing" : "Invite a friend"}
    </button>
  );
}
