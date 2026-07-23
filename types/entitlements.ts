export type ProductCapability =
  | "unlimited_likes"
  | "super_likes"
  | "advanced_filters"
  | "incognito"
  | "read_receipts"
  | "ai_profile_coach"
  | "ai_replies"
  | "ai_date_planner"
  | "groups"
  | "events"
  | "gifts";

export interface Entitlement {
  capability: ProductCapability;
  enabled: boolean;
  source: "free_launch" | "subscription" | "promotion" | "admin";
  expiresAt?: string;
}
