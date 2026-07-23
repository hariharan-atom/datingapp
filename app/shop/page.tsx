"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { catalogService } from "@/services/catalog";
import type { ShopProduct } from "@/types/domain";
import { shopProducts } from "@/utils/mock-data";

const categories = ["All", "Flowers", "Food", "Keepsakes"] as const;

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(pricePaise / 100);
}

export default function ShopPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const { data: products = shopProducts } = useQuery({
    queryKey: ["shop-products"],
    queryFn: () => catalogService.listActive(),
    placeholderData: shopProducts,
  });

  const visibleProducts =
    category === "All"
      ? products
      : products.filter((product) => product.category === category);

  const cartProducts = useMemo(
    () =>
      products
        .filter((product) => cart[product.id])
        .map((product) => ({
          product,
          quantity: cart[product.id],
        })),
    [cart, products],
  );
  const cartCount = cartProducts.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const cartTotal = cartProducts.reduce(
    (total, item) => total + item.product.pricePaise * item.quantity,
    0,
  );

  const changeQuantity = (productId: string, change: number) => {
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[productId] ?? 0) + change);
      const next = { ...current };
      if (nextQuantity === 0) delete next[productId];
      else next[productId] = nextQuantity;
      return next;
    });
  };

  const placeOrder = async () => {
    if (!cartProducts.length) return;
    setPlacingOrder(true);
    try {
      await catalogService.createOrder(
        cartProducts.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
        deliveryNote,
      );
      setCart({});
      setDeliveryNote("");
      setCartOpen(false);
      toast.success("Order confirmed", {
        description: "We’ll keep you updated as your order is prepared.",
      });
    } catch (error) {
      toast.error("Couldn’t place your order", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <AppShell title="Shop" right="search" hideAi>
      <div className="space-y-7 px-4 pt-4 min-[768px]:px-6">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B1F3A] via-primary to-secondary p-5 text-white shadow-soft">
          <div className="absolute -right-10 -top-12 size-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-16 right-14 size-32 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative">
            <span className="bg-white/12 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
              <Sparkles className="size-3.5" />
              Thoughtfully curated
            </span>
            <h1 className="mt-4 max-w-[280px] text-[28px] font-bold leading-[1.08] tracking-[-0.045em]">
              Little things that say a lot.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
              Send something meaningful or make your next date feel extra
              special.
            </p>
            <div className="mt-5 flex items-center gap-4 text-[11px] font-semibold text-white/80">
              <span className="flex items-center gap-1.5">
                <Truck className="size-4" />
                Delivery across India
              </span>
              <span className="flex items-center gap-1.5">
                <PackageCheck className="size-4" />
                Secure packing
              </span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                The Atom Shop
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.035em]">
                Pick something lovely
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary"
              aria-label={`Open cart with ${cartCount} items`}
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-white bg-primary px-1 text-[10px] font-bold leading-4 text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 min-[768px]:-mx-6 min-[768px]:px-6">
            {categories.map((item) => (
              <Chip
                key={item}
                active={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </Chip>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 min-[768px]:grid-cols-3">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              quantity={cart[product.id] ?? 0}
              onAdd={() => changeQuantity(product.id, 1)}
            />
          ))}
        </section>

        <section className="flex items-center gap-4 rounded-card border border-primary/10 bg-primary-soft p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-white text-primary shadow-soft">
            <Heart className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">Products managed by admins</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Availability, pricing, and catalog updates sync from the secure
              admin-managed product database.
            </p>
          </div>
        </section>
      </div>

      {cartCount > 0 && (
        <motion.button
          type="button"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-4 bottom-[calc(76px+var(--safe-bottom))] z-30 mx-auto flex h-14 max-w-md items-center rounded-[20px] bg-ink px-4 text-white shadow-float"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-white/10 text-sm font-bold">
            {cartCount}
          </span>
          <span className="ml-3 text-sm font-bold">View your bag</span>
          <span className="ml-auto text-sm font-bold">
            {formatPrice(cartTotal)}
          </span>
          <ChevronRight className="ml-1 size-4" />
        </motion.button>
      )}

      <BottomSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Your bag"
        description={
          cartCount
            ? `${cartCount} ${cartCount === 1 ? "item" : "items"} ready to order`
            : "Add something thoughtful"
        }
      >
        {cartProducts.length ? (
          <>
            <div className="space-y-3">
              {cartProducts.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-card bg-surface p-3"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-[18px] bg-primary-soft">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{product.name}</p>
                    <p className="mt-1 text-xs font-semibold text-primary">
                      {formatPrice(product.pricePaise)}
                    </p>
                  </div>
                  <div className="flex items-center rounded-2xl border border-border bg-white p-1">
                    <button
                      type="button"
                      onClick={() => changeQuantity(product.id, -1)}
                      className="grid size-8 place-items-center rounded-xl"
                      aria-label={`Remove one ${product.name}`}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(product.id, 1)}
                      className="grid size-8 place-items-center rounded-xl"
                      aria-label={`Add one ${product.name}`}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-bold">
                Delivery note
              </span>
              <textarea
                value={deliveryNote}
                onChange={(event) => setDeliveryNote(event.target.value)}
                rows={3}
                maxLength={240}
                placeholder="Add the recipient, address, or a thoughtful note…"
                className="w-full resize-none rounded-input border border-border bg-surface p-4 text-sm leading-6 outline-none focus:border-primary/30"
              />
            </label>
            <div className="my-5 flex items-center justify-between border-y border-border py-4">
              <span className="text-sm font-semibold text-muted">
                Order total
              </span>
              <span className="text-lg font-black">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <Button
              fullWidth
              size="lg"
              loading={placingOrder}
              onClick={() => void placeOrder()}
            >
              <Check className="size-5" />
              Place order
            </Button>
          </>
        ) : (
          <div className="py-12 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-primary-soft text-primary">
              <ShoppingBag className="size-7" />
            </span>
            <p className="mt-4 font-bold">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted">
              Choose something lovely from the catalog.
            </p>
          </div>
        )}
      </BottomSheet>
    </AppShell>
  );
}

function ProductCard({
  product,
  index,
  quantity,
  onAdd,
}: {
  product: ShopProduct;
  index: number;
  quantity: number;
  onAdd: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045 }}
      className="min-w-0 overflow-hidden rounded-card border border-border bg-white shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-primary-soft">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 767px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-primary shadow-sm backdrop-blur">
            {product.badge}
          </span>
        )}
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
          <Star className="size-2.5 fill-accent text-accent" />
          {product.rating}
        </span>
      </div>
      <div className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
          {product.category}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-muted">
          {product.description}
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-sm font-black">
            {formatPrice(product.pricePaise)}
          </span>
          {product.compareAtPricePaise && (
            <span className="text-[10px] text-muted line-through">
              {formatPrice(product.compareAtPricePaise)}
            </span>
          )}
          <button
            type="button"
            onClick={onAdd}
            className="relative ml-auto grid size-9 place-items-center rounded-[14px] bg-primary text-white shadow-glow"
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus className="size-4" />
            {quantity > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full border border-white bg-ink text-[8px] font-bold">
                {quantity}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
