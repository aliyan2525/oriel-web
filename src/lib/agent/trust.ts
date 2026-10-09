/**
 * Trust levels: how much a host lets agents in a room share with one friend.
 * Levels nest. A higher level includes everything below it.
 * Missing rows mean "none", so the default is least privilege.
 */
export const TRUST_LEVELS = ["none", "availability", "plans", "profile"] as const;
export type TrustLevel = (typeof TRUST_LEVELS)[number];

/** Kinds of information an agent can hold about its owner. */
export type InfoCategory = "availability" | "plans" | "profile";

const LEVEL_RANK: Record<TrustLevel, number> = { none: 0, availability: 1, plans: 2, profile: 3 };
const CATEGORY_RANK: Record<InfoCategory, number> = { availability: 1, plans: 2, profile: 3 };

/** Whether a friend at this trust level may receive information in this category. */
export function shareAllowed(level: TrustLevel, category: InfoCategory): boolean {
  return LEVEL_RANK[level] >= CATEGORY_RANK[category];
}

export type OwnerFacts = Record<InfoCategory, string[]>;

/**
 * The only lines an agent may place in front of the model when speaking to this friend.
 * Everything above the friend's level is withheld before the model is called.
 */
export function sharedContext(facts: OwnerFacts, level: TrustLevel): string[] {
  const categories = (Object.keys(CATEGORY_RANK) as InfoCategory[]).filter((c) => shareAllowed(level, c));
  return categories.flatMap((c) => facts[c].map((line) => `[${c}] ${line}`));
}

/** A friend with no stored level is treated as "none". */
export function effectiveLevel(stored: string | null | undefined): TrustLevel {
  return (TRUST_LEVELS as readonly string[]).includes(stored ?? "") ? (stored as TrustLevel) : "none";
}
