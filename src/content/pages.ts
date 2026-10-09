export type Item = { title: string; body: string };

export type Block =
  | { type: "cards"; title?: string; items: Item[] }
  | { type: "steps"; title?: string; items: Item[] }
  | { type: "prose"; title?: string; paragraphs: string[] }
  | {
      type: "tiers";
      items: {
        name: string;
        price: string;
        body: string;
        features: string[];
        cta: string;
        href: string;
        featured?: boolean;
      }[];
    }
  | { type: "faq"; title?: string; items: { q: string; a: string }[] };

export type ContentPage = {
  slug: string;
  title: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  blocks: Block[];
  cta?: { headline: string; label: string; href: string };
};

/** Marketing pages. Add an entry here and the route, metadata and sitemap follow. */
export const pages: ContentPage[] = [
  {
    slug: "how-it-works",
    title: "How it works",
    eyebrow: "How it works",
    headline: "Ask once. Approve once. Review anytime.",
    subhead: "One plan, from first message to confirmed time, with you in control at every step.",
    blocks: [
      {
        type: "steps",
        title: "A plan in four steps",
        items: [
          { title: "Ask", body: "Tell your agent what you need, such as dinner with three friends this week." },
          { title: "Propose", body: "Your agent and your friends' agents share only what each person has allowed." },
          { title: "Approve", body: "You get one clear proposal. Nothing is booked until you approve it." },
          { title: "Review", body: "Every message and decision is recorded in your activity log." },
        ],
      },
      {
        type: "cards",
        title: "What your agent can do",
        items: [
          { title: "Work within your scopes", body: "Use only the information you have allowed, such as availability." },
          { title: "Propose options", body: "Suggest times and places to you and to your friends." },
          { title: "Draft for review", body: "Prepare replies and confirmations that you read before they go out." },
        ],
      },
      {
        type: "cards",
        title: "What it cannot do without you",
        items: [
          { title: "Book or pay", body: "Money and bookings always wait for your approval." },
          { title: "Talk to strangers", body: "Your agent only exchanges messages with friends you have connected." },
          { title: "Widen your scopes", body: "Only you can change what your agent may share." },
        ],
      },
    ],
    cta: { headline: "Ready to plan without the group chat?", label: "Join the waitlist", href: "/join" },
  },
  {
    slug: "privacy-and-trust",
    title: "Trust and privacy",
    eyebrow: "Trust and privacy",
    headline: "Privacy is the product.",
    subhead: "You decide what your agent can share, approve every change, and keep a complete record.",
    blocks: [
      {
        type: "cards",
        title: "Five commitments",
        items: [
          { title: "You set the scope", body: "Each friend sees only what you have allowed for that friend." },
          { title: "Approval before action", body: "Nothing is booked, sent, or confirmed without your tap." },
          { title: "A full activity log", body: "Every agent message and tool call is recorded and searchable." },
          { title: "Export or delete anytime", body: "Download or delete your data whenever you choose." },
          { title: "No training on your data", body: "We do not train models on your data without your consent." },
        ],
      },
      {
        type: "prose",
        title: "What we store",
        paragraphs: [
          "We store the account details you give us, your sharing scopes, the plans you create, and your activity log. We do not sell your data or share it with advertisers.",
          "The full privacy policy will be published before launch. If something goes wrong, we will tell affected users promptly and explain what happened.",
        ],
      },
    ],
    cta: { headline: "Want in on the first pilot groups?", label: "Join the waitlist", href: "/join" },
  },
  {
    slug: "pricing",
    title: "Pricing",
    eyebrow: "Pricing",
    headline: "Start free. Upgrade when your group grows.",
    subhead: "Prices are placeholders until pilot testing is complete.",
    blocks: [
      {
        type: "tiers",
        items: [
          {
            name: "Free",
            price: "$0",
            body: "Try Oriel with a small group.",
            features: ["Personal agent and memory", "Up to two friend connections", "One active group plan"],
            cta: "Join the waitlist",
            href: "/join",
          },
          {
            name: "Plus",
            price: "$5 / month",
            body: "For friend groups that plan every week.",
            features: ["Unlimited friend connections", "Unlimited group plans", "Longer memory and priority support"],
            cta: "Join the waitlist",
            href: "/join",
            featured: true,
          },
        ],
      },
      {
        type: "faq",
        title: "Pricing questions",
        items: [
          { q: "Is the free plan really free?", a: "Yes. No card is required. We will tell you in advance before any change affects your plan." },
          { q: "Will you train models on my data?", a: "No, not without your consent." },
          { q: "Can I change plans later?", a: "Yes. You can upgrade or downgrade at any time." },
        ],
      },
    ],
  },
  {
    slug: "features",
    title: "Features",
    eyebrow: "Features",
    headline: "Every feature, and the control you keep over it.",
    subhead: "Oriel is built around one rule: your agent proposes, and you decide. Here is how each part works.",
    blocks: [
      {
        type: "cards",
        title: "Core features",
        items: [
          { title: "Personal agent", body: "Your agent remembers the details you choose to share, such as the days you prefer, the places you avoid, and your usual schedule. You can read, edit, or delete any memory, and it only draws on what a task needs." },
          { title: "Friend connections", body: "Connect through an invite code or QR scan, so nobody can add you by username alone. Each friend gets its own scopes, such as availability only, or plans and interests. Narrowing or revoking a scope takes effect before the next message." },
          { title: "Agent exchange", body: "Agents talk in typed messages: proposal, question, answer, or decline. Typed messages keep every exchange unambiguous. Each thread has a turn limit and a time budget, so nothing loops or runs on indefinitely." },
          { title: "Approval inbox", body: "Anything that changes something outside Oriel, such as sending a message, confirming a booking, or accepting a plan, waits for your approval. Pending requests time out, so an old request never fires by surprise." },
          { title: "Activity log", body: "Every agent message and tool call is recorded with the scope that allowed it, in one searchable timeline. Ask your agent what it told a friend's agent and you get the exact record, not a summary." },
          { title: "Group plans", body: "Three to six people share one thread. The organizer sets the goal, agents propose options, and each member approves or edits. A plan is final only when everyone has approved it, and the decision is recorded." },
        ],
      },
      {
        type: "steps",
        title: "How you stay in control",
        items: [
          { title: "Set the scope", body: "Choose what each friend's agent can see, one category at a time." },
          { title: "Your agent proposes", body: "It works only inside those scopes, and the proposal shows what it used." },
          { title: "You approve or edit", body: "Nothing outside Oriel happens without your tap." },
          { title: "Review anytime", body: "The activity log shows every step, and you can revoke access in one tap." },
        ],
      },
      {
        type: "cards",
        title: "Connectors and your data",
        items: [
          { title: "Calendar, read-only", body: "At launch, Oriel reads free and busy times. Event titles stay private unless you turn them on." },
          { title: "Notes, read-only", body: "Your agent can read notes to understand your preferences. Any write waits for your approval." },
          { title: "Export and delete", body: "Download everything Oriel holds, or delete your account. Deletion removes your data from active systems, and backups expire on a published schedule." },
        ],
      },
    ],
    cta: { headline: "See it working before everyone else does.", label: "Join the waitlist", href: "/join" },
  },
];

export function getPage(slug: string): ContentPage | undefined {
  return pages.find((page) => page.slug === slug);
}
