import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

// Map Vite asset paths (used as fallback for seed data) to real imports
const assetMap: Record<string, string> = {
  "/src/assets/product-1.jpg": product1,
  "/src/assets/product-2.jpg": product2,
  "/src/assets/product-4.jpg": product4,
  "/src/assets/product-5.jpg": product5,
  "/src/assets/product-6.jpg": product6,
};

export interface DBProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sizes: string[];
  details: string[];
  is_active: boolean;
  is_featured: boolean;
}

export interface StockEntry {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
}

export const resolveImage = (path: string): string => assetMap[path] ?? path;

export function useProducts(opts?: { onlyActive?: boolean; featured?: boolean }) {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (opts?.onlyActive !== false) query = query.eq("is_active", true);
    if (opts?.featured) query = query.eq("is_featured", true);
    const { data, error } = await query;
    if (!error && data) {
      setProducts(
        data.map((p) => ({
          ...p,
          price: Number(p.price),
          image: resolveImage(p.image),
        })) as DBProduct[]
      );
    }
    setLoading(false);
  }, [opts?.onlyActive, opts?.featured]);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_stock" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProduct({ ...data, price: Number(data.price), image: resolveImage(data.image) } as DBProduct);
        }
        setLoading(false);
      });
  }, [id]);

  return { product, loading };
}
