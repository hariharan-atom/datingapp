import { AlertTriangle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { AdminShopDashboard } from "@/features/shop/components/admin-shop-dashboard";
import type { AdminShopOrder, AdminShopProduct } from "@/services/catalog";
import { createClient } from "@/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/shop");

  const { data: membership, error: membershipError } = await supabase
    .from("shop_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    return (
      <AdminState
        icon="warning"
        title="Shop database setup required"
        description="The admin catalog tables are not available on this Supabase project. Apply the shop catalog migration, then reload this page."
      />
    );
  }

  if (!membership) {
    return (
      <AdminState
        icon="locked"
        title="Admin access required"
        description="Your account is signed in, but it has not been added to the shop_admins table. Customer accounts cannot change products or orders."
      />
    );
  }

  const [
    { data: products, error: productError },
    { data: orders, error: orderError },
  ] = await Promise.all([
    supabase
      .from("shop_products")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("shop_orders")
      .select("id,user_id,status,delivery_note,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (productError || orderError) {
    return (
      <AdminState
        icon="warning"
        title="Couldn’t load the admin workspace"
        description={
          productError?.message ?? orderError?.message ?? "Try again."
        }
      />
    );
  }

  return (
    <AppShell title="Shop admin" back hideNav hideAi right="profile">
      <AdminShopDashboard
        initialProducts={(products ?? []) as AdminShopProduct[]}
        initialOrders={(orders ?? []) as AdminShopOrder[]}
      />
    </AppShell>
  );
}

function AdminState({
  icon,
  title,
  description,
}: {
  icon: "locked" | "warning";
  title: string;
  description: string;
}) {
  const Icon = icon === "locked" ? LockKeyhole : AlertTriangle;
  return (
    <AppShell title="Shop admin" back hideNav hideAi right="profile">
      <div className="grid min-h-[calc(100dvh-60px-var(--safe-top))] place-items-center px-6">
        <section className="max-w-sm text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-[28px] bg-primary-soft text-primary shadow-soft">
            <Icon className="size-8" />
          </span>
          <h1 className="mt-6 text-2xl font-black tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-12 items-center rounded-button bg-primary px-5 text-sm font-bold text-white"
          >
            Return to shop
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
