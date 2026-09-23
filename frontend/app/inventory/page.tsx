"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Package, Plus, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function InventoryPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<Product[]>("/products/"),
    enabled: ready,
  });

  if (!ready) return null;

  const lowStockCount = products?.filter((p) => p.is_low_stock).length ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <PageHeader
          title="Inventory"
          description={
            products
              ? `${products.length} product${products.length === 1 ? "" : "s"}${lowStockCount > 0 ? ` · ${lowStockCount} low on stock` : ""}`
              : undefined
          }
          action={
            <Button onClick={() => router.push("/inventory/new")}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Product
            </Button>
          }
        />

        {isLoading && <p className="text-muted-foreground">Loading products...</p>}
        {isError && <p className="text-destructive">Couldn&apos;t load products. Please try again.</p>}

        {products && products.length === 0 && (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your first product to start tracking stock."
            actionLabel="Add Product"
            onAction={() => router.push("/inventory/new")}
          />
        )}

        {products && products.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => router.push(`/inventory/${product.id}`)}
                    className="cursor-pointer border-t border-border transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{product.sku || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">Rs. {product.price}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {product.is_low_stock && (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        <span
                          className={
                            product.is_low_stock ? "text-destructive font-medium" : "text-foreground"
                          }
                        >
                          {product.stock_quantity}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}