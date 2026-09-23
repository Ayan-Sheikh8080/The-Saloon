"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Product } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProductPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [reorderLevel, setReorderLevel] = useState("5");
  const [initialQuantity, setInitialQuantity] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.post<Product>("/products/", {
        name,
        sku,
        price,
        cost: cost || "0",
        reorder_level: Number(reorderLevel),
        initial_quantity: initialQuantity ? Number(initialQuantity) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/inventory");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-8 py-10">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-2xl italic">New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rs.)</Label>
                  <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (Rs.)</Label>
                  <Input id="cost" type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorder">Reorder Level</Label>
                  <Input id="reorder" type="number" min="0" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial">Initial Stock</Label>
                  <Input id="initial" type="number" min="0" value={initialQuantity} onChange={(e) => setInitialQuantity(e.target.value)} />
                </div>
              </div>

              {mutation.isError && (
                <p className="text-sm text-destructive">
                  {mutation.error instanceof ApiError ? mutation.error.message : "Something went wrong. Please try again."}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={mutation.isPending} className="flex-1">
                  {mutation.isPending ? "Saving..." : "Save product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}