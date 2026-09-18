"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Sale } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready } = useAuthGuard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [sale, setSale] = useState<Sale | null>(null);
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState("");

  const createSaleMutation = useMutation({
    mutationFn: () =>
      api.post<Sale>("/sales/from-appointment/", { appointment: Number(id) }),
    onSuccess: (data) => {
      setSale(data);
      setAmount(data.total);
    },
  });

  useEffect(() => {
    if (ready) {
      createSaleMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const payMutation = useMutation({
    mutationFn: () =>
      api.post<Sale>(`/sales/${sale?.id}/pay/`, { method, amount }),
    onSuccess: (data) => {
      setSale(data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    payMutation.mutate();
  }

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-8 py-10">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-2xl italic">Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {createSaleMutation.isPending && (
              <p className="text-sm text-muted-foreground">Loading sale...</p>
            )}

            {sale && (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    {sale.customer_name}
                  </p>
                  <div className="space-y-1 rounded-md border border-border p-3">
                    {sale.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.description} x{item.quantity}
                        </span>
                        <span className="text-foreground">Rs. {item.line_total}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-medium">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">Rs. {sale.total}</span>
                    </div>
                    {Number(sale.amount_paid) > 0 && (
                      <div className="flex justify-between text-sm text-chart-2">
                        <span>Paid</span>
                        <span>Rs. {sale.amount_paid}</span>
                      </div>
                    )}
                  </div>
                </div>

                {sale.status === "paid" ? (
                  <div className="rounded-md border border-chart-2/40 bg-chart-2/10 p-3 text-center text-sm font-medium text-chart-2">
                    Paid in full
                  </div>
                ) : (
                  <form onSubmit={handlePay} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select method">
                            {(value: string) =>
                              METHODS.find((m) => m.value === value)?.label ?? "Select method"
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>

                    {payMutation.isError && (
                      <p className="text-sm text-destructive">
                        {payMutation.error instanceof ApiError
                          ? payMutation.error.message
                          : "Something went wrong."}
                      </p>
                    )}

                    <Button type="submit" className="w-full" disabled={payMutation.isPending}>
                      {payMutation.isPending ? "Processing..." : "Record Payment"}
                    </Button>
                  </form>
                )}
              </>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/appointments")}
            >
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}