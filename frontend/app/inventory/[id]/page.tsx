"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Product, InventoryTransaction } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASONS = [
  { value: "received", label: "Stock Received" },
  { value: "used", label: "Used in Service" },
  { value: "sold", label: "Sold" },
  { value: "correction", label: "Manual Correction" },
  { value: "damaged", label: "Damaged/Lost" },
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready } = useAuthGuard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("received");
  const [notes, setNotes] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["products", id],
    queryFn: () => api.get<Product>(`/products/${id}/`),
    enabled: ready,
  });

  const { data: transactions } = useQuery({
    queryKey: ["products", id, "transactions"],
    queryFn: () => api.get<InventoryTransaction[]>(`/products/${id}/transactions/`),
    enabled: ready,
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      api.post(`/products/${id}/transactions/`, {
        quantity_delta: Number(delta),
        reason,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", id] });
      queryClient.invalidateQueries({ queryKey: ["products", id, "transactions"] });
      setDelta("");
      setNotes("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/products/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/inventory");
    },
  });

  function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    adjustMutation.mutate();
  }

  if (!ready || isLoading || !product) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-8 py-10">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-2xl italic">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              SKU: {product.sku || "—"} · Rs. {product.price}
            </p>
            <p className={`text-sm font-medium ${product.is_low_stock ? "text-destructive" : "text-foreground"}`}>
              Current stock: {product.stock_quantity}
              {product.is_low_stock && " (low stock)"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAdjust} className="space-y-4">
              <p className="text-sm font-medium text-foreground">Adjust Stock</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delta">Quantity (+/-)</Label>
                  <Input
                    id="delta"
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(e.target.value)}
                    placeholder="e.g. 10 or -2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select reason">
                        {(value: string) =>
                          REASONS.find((r) => r.value === value)?.label ?? "Select reason"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              {adjustMutation.isError && (
                <p className="text-sm text-destructive">
                  {adjustMutation.error instanceof ApiError
                    ? adjustMutation.error.message
                    : "Something went wrong."}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={adjustMutation.isPending}>
                {adjustMutation.isPending ? "Recording..." : "Record Adjustment"}
              </Button>
            </form>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Transaction History</p>
              <div className="space-y-1">
                {transactions?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No transactions yet.</p>
                )}
                {transactions?.map((txn) => (
                  <div key={txn.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {txn.reason.replace("_", " ")}
                      {txn.notes && ` — ${txn.notes}`}
                    </span>
                    <span className={txn.quantity_delta > 0 ? "text-chart-2" : "text-destructive"}>
                      {txn.quantity_delta > 0 ? "+" : ""}
                      {txn.quantity_delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/inventory")}
            >
              Back to Inventory
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm(`Delete ${product.name}? This can't be undone.`)) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Delete Product
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}