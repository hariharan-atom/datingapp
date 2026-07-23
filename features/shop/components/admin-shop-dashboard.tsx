"use client";

import {
  PackagePlus,
  Save,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  catalogAdminService,
  type AdminShopOrder,
  type AdminShopProduct,
} from "@/services/catalog";

const orderStatuses: AdminShopOrder["status"][] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export function AdminShopDashboard({
  initialProducts,
  initialOrders,
}: {
  initialProducts: AdminShopProduct[];
  initialOrders: AdminShopOrder[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [saving, setSaving] = useState<string>();
  const [creating, setCreating] = useState(false);

  const updateProduct = async (
    id: string,
    updates: Partial<Pick<AdminShopProduct, "stock" | "is_active">>,
  ) => {
    setSaving(id);
    try {
      await catalogAdminService.updateProduct(id, updates);
      setProducts((current) =>
        current.map((product) =>
          product.id === id ? { ...product, ...updates } : product,
        ),
      );
      toast.success("Product updated");
    } catch (error) {
      toast.error("Couldn’t update product", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(undefined);
    }
  };

  const createProduct = async (formData: FormData) => {
    const name = String(formData.get("name") ?? "").trim();
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const product: AdminShopProduct = {
      id,
      name,
      description: String(formData.get("description") ?? "").trim(),
      category: String(
        formData.get("category"),
      ) as AdminShopProduct["category"],
      price_paise: Math.round(Number(formData.get("price")) * 100),
      compare_at_price_paise: null,
      image_url: String(formData.get("image_url") ?? "").trim(),
      badge: null,
      rating: 5,
      stock: Number(formData.get("stock")),
      sort_order: products.length * 10 + 10,
      is_active: true,
    };

    setCreating(true);
    try {
      await catalogAdminService.createProduct(product);
      setProducts((current) => [...current, product]);
      toast.success("Product added to the shop");
    } catch (error) {
      toast.error("Couldn’t add product", {
        description:
          error instanceof Error ? error.message : "Please check every field.",
      });
    } finally {
      setCreating(false);
    }
  };

  const updateOrder = async (id: string, status: AdminShopOrder["status"]) => {
    setSaving(id);
    try {
      await catalogAdminService.updateOrderStatus(id, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status } : order,
        ),
      );
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Couldn’t update order", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(undefined);
    }
  };

  return (
    <div className="space-y-8 px-4 pt-4 min-[768px]:px-6">
      <section className="rounded-card bg-gradient-to-br from-[#0B1F3A] to-primary p-5 text-white shadow-soft">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
          Secure catalog workspace
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
          Shop administration
        </h2>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric label="Products" value={products.length} />
          <Metric
            label="Active"
            value={products.filter((product) => product.is_active).length}
          />
          <Metric label="Orders" value={orders.length} />
        </div>
      </section>

      <details className="group rounded-card border border-border bg-white p-4 shadow-soft">
        <summary className="flex cursor-pointer list-none items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
            <PackagePlus className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold">Add a product</p>
            <p className="mt-0.5 text-xs text-muted">Publish a new shop item</p>
          </div>
        </summary>
        <form
          action={(formData) => void createProduct(formData)}
          className="mt-5 space-y-3 border-t border-border pt-5"
        >
          <AdminInput name="name" label="Product name" required />
          <AdminInput
            name="description"
            label="Description"
            required
            multiline
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-bold">
              Category
              <select
                name="category"
                className="mt-2 h-12 w-full rounded-[16px] border border-border bg-surface px-3 text-sm"
              >
                <option>Flowers</option>
                <option>Food</option>
                <option>Keepsakes</option>
              </select>
            </label>
            <AdminInput
              name="price"
              label="Price (₹)"
              type="number"
              min="1"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminInput
              name="stock"
              label="Stock"
              type="number"
              min="0"
              required
            />
            <AdminInput
              name="image_url"
              label="Image path"
              placeholder="/images/shop/item.webp"
              required
            />
          </div>
          <Button type="submit" fullWidth loading={creating}>
            <PackagePlus className="size-4" />
            Add product
          </Button>
        </form>
      </details>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Catalog
            </p>
            <h2 className="mt-1 text-xl font-black">Products</h2>
          </div>
          <span className="text-xs font-semibold text-muted">
            {products.length} total
          </span>
        </div>
        <div className="space-y-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex gap-3 rounded-card border border-border bg-white p-3 shadow-soft"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-[18px] bg-primary-soft">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{product.name}</p>
                    <p className="mt-1 text-xs font-bold text-primary">
                      ₹{(product.price_paise / 100).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={saving === product.id}
                    onClick={() =>
                      void updateProduct(product.id, {
                        is_active: !product.is_active,
                      })
                    }
                    aria-label={
                      product.is_active
                        ? "Unpublish product"
                        : "Publish product"
                    }
                    className="text-primary disabled:opacity-50"
                  >
                    {product.is_active ? (
                      <ToggleRight className="size-7" />
                    ) : (
                      <ToggleLeft className="size-7 text-muted" />
                    )}
                  </button>
                </div>
                <label className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-muted">
                  Stock
                  <input
                    type="number"
                    min="0"
                    defaultValue={product.stock}
                    onBlur={(event) => {
                      const stock = Number(event.currentTarget.value);
                      if (stock !== product.stock) {
                        void updateProduct(product.id, { stock });
                      }
                    }}
                    className="h-8 w-20 rounded-xl border border-border bg-surface px-2 text-xs font-bold text-ink"
                  />
                  {saving === product.id && (
                    <Save className="ml-auto size-3.5 animate-pulse text-primary" />
                  )}
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Fulfilment
          </p>
          <h2 className="mt-1 text-xl font-black">Recent orders</h2>
        </div>
        {orders.length ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-card border border-border bg-white p-4 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <ShoppingBag className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    disabled={saving === order.id}
                    onChange={(event) =>
                      void updateOrder(
                        order.id,
                        event.target.value as AdminShopOrder["status"],
                      )
                    }
                    className="ml-auto h-10 rounded-[14px] border border-border bg-surface px-2 text-[11px] font-bold capitalize"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
                {order.delivery_note && (
                  <p className="mt-3 rounded-2xl bg-surface p-3 text-xs leading-5 text-muted">
                    {order.delivery_note}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border p-8 text-center">
            <ShoppingBag className="mx-auto size-6 text-muted" />
            <p className="mt-3 text-sm font-bold">No orders yet</p>
            <p className="mt-1 text-xs text-muted">
              New customer orders will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] bg-white/10 p-3 text-center">
      <p className="text-xl font-black">{value}</p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/60">
        {label}
      </p>
    </div>
  );
}

function AdminInput({
  label,
  multiline,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  multiline?: boolean;
}) {
  return (
    <label className="block text-xs font-bold">
      {label}
      {multiline ? (
        <textarea
          name={props.name}
          required={props.required}
          rows={3}
          className="mt-2 w-full resize-none rounded-[16px] border border-border bg-surface p-3 text-sm font-normal"
        />
      ) : (
        <input
          {...props}
          className="mt-2 h-12 w-full rounded-[16px] border border-border bg-surface px-3 text-sm font-normal"
        />
      )}
    </label>
  );
}
