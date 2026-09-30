"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Customer, LoyaltyInfo } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppShell } from "@/components/app-shell";

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready } = useAuthGuard();
  const router = useRouter();
  const queryClient = useQueryClient();

    const { data: customer, isLoading } = useQuery({
    queryKey: ["customers", id],
    queryFn: () => api.get<Customer>(`/customers/${id}/`),
    enabled: ready,
  });

  const { data: loyalty } = useQuery({
    queryKey: ["loyalty", id],
    queryFn: () => api.get<LoyaltyInfo>(`/loyalty/customers/${id}/loyalty/`),
    enabled: ready,
  });

  const [redeemPoints, setRedeemPoints] = useState("");

  const redeemMutation = useMutation({
    mutationFn: () =>
      api.post<{ balance: number }>(`/loyalty/customers/${id}/loyalty/redeem/`, {
        points: Number(redeemPoints),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty", id] });
      setRedeemPoints("");
    },
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email);
      setDateOfBirth(customer.date_of_birth ?? "");
      setNotes(customer.notes);
    }
  }, [customer]);

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch<Customer>(`/customers/${id}/`, {
        name,
        phone,
        email,
        date_of_birth: dateOfBirth || null,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      router.push("/customers");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/customers/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      router.push("/customers");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate();
  }

  function handleDelete() {
    if (confirm(`Delete ${customer?.name}? This can't be undone.`)) {
      deleteMutation.mutate();
    }
  }

  if (!ready || isLoading) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-8 py-10">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-2xl italic">
              Edit Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {updateMutation.isError && (
                <p className="text-sm text-destructive">
                  {updateMutation.error instanceof ApiError
                    ? updateMutation.error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/customers")}
                >
                  Cancel
                </Button>
              </div>

              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete customer"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {loyalty && (
          <Card className="mt-6 border-border/60">
            <CardHeader>
              <CardTitle className="font-heading text-xl italic">Loyalty Points</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-medium text-foreground">{loyalty.balance} pts</p>

              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Points to redeem"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => redeemMutation.mutate()}
                  disabled={!redeemPoints || redeemMutation.isPending}
                >
                  Redeem
                </Button>
              </div>

              {redeemMutation.isError && (
                <p className="text-sm text-destructive">
                  {redeemMutation.error instanceof ApiError
                    ? redeemMutation.error.message
                    : "Something went wrong."}
                </p>
              )}

              {loyalty.transactions.length > 0 && (
                <div className="space-y-1 border-t border-border pt-3">
                  {loyalty.transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{t.reason}</span>
                      <span className={t.points_delta > 0 ? "text-chart-2" : "text-destructive"}>
                        {t.points_delta > 0 ? "+" : ""}
                        {t.points_delta}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}