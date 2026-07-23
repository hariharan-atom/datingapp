import type { Entitlement, ProductCapability } from "@/types/entitlements";

const allCapabilities: ProductCapability[] = [
  "unlimited_likes",
  "super_likes",
  "advanced_filters",
  "incognito",
  "read_receipts",
  "ai_profile_coach",
  "ai_replies",
  "ai_date_planner",
  "groups",
  "events",
  "gifts",
];

/**
 * Every capability is enabled for launch. UI and domain logic depend on this
 * entitlement contract—not on plan names—so subscriptions can be introduced
 * later by changing the resolver rather than rewriting feature components.
 */
export const entitlementService = {
  async getAll(): Promise<Entitlement[]> {
    return allCapabilities.map((capability) => ({
      capability,
      enabled: true,
      source: "free_launch",
    }));
  },

  async can(capability: ProductCapability): Promise<boolean> {
    const entitlements = await this.getAll();
    return entitlements.some(
      (entitlement) =>
        entitlement.capability === capability && entitlement.enabled,
    );
  },
};
