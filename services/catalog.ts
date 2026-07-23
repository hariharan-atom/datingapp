import { createClient, isSupabaseConfigured } from "@/supabase/client";
import type { ShopProduct } from "@/types/domain";
import { shopProducts } from "@/utils/mock-data";

interface CatalogRow {
  id: string;
  name: string;
  description: string;
  category: ShopProduct["category"];
  price_paise: number;
  compare_at_price_paise: number | null;
  image_url: string;
  badge: string | null;
  rating: number;
  stock: number;
}

export interface AdminShopProduct extends CatalogRow {
  sort_order: number;
  is_active: boolean;
}

export interface AdminShopOrder {
  id: string;
  user_id: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  delivery_note: string | null;
  created_at: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

function mapProduct(row: CatalogRow): ShopProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    pricePaise: row.price_paise,
    compareAtPricePaise: row.compare_at_price_paise ?? undefined,
    image: row.image_url,
    badge: row.badge ?? undefined,
    rating: Number(row.rating),
    stock: row.stock,
  };
}

export const catalogService = {
  async listActive(): Promise<ShopProduct[]> {
    if (!isSupabaseConfigured()) return shopProducts;

    const { data, error } = await createClient()
      .from("shop_products")
      .select(
        "id,name,description,category,price_paise,compare_at_price_paise,image_url,badge,rating,stock",
      )
      .eq("is_active", true)
      .gt("stock", 0)
      .order("sort_order");

    if (error || !data?.length) return shopProducts;
    return (data as CatalogRow[]).map(mapProduct);
  },

  async createOrder(lines: CartLine[], deliveryNote?: string) {
    if (!isSupabaseConfigured()) {
      return {
        id: crypto.randomUUID(),
        status: "confirmed" as const,
      };
    }

    const { data, error } = await createClient().rpc("place_shop_order", {
      order_lines: lines.map((line) => ({
        product_id: line.productId,
        quantity: line.quantity,
      })),
      note: deliveryNote || null,
    });

    if (error) throw error;
    return { id: data as string, status: "confirmed" as const };
  },
};

export const catalogAdminService = {
  async createProduct(product: AdminShopProduct) {
    const { error } = await createClient()
      .from("shop_products")
      .insert(product);
    if (error) throw error;
  },

  async updateProduct(
    id: string,
    updates: Partial<
      Pick<
        AdminShopProduct,
        "stock" | "is_active" | "price_paise" | "sort_order"
      >
    >,
  ) {
    const { error } = await createClient()
      .from("shop_products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async updateOrderStatus(id: string, status: AdminShopOrder["status"]) {
    const { error } = await createClient()
      .from("shop_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
