"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { MembershipPlan, CustomerMembership, Customer } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MembershipsPage() {
  const { ready } = useAuthGuard();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [durationDays, setDurationDays] = useState("180");
  const [price, setPrice] = useState("");

  const [enrollCustomerId, setEnrollCustomerId] = useState("");
  const [enrollPlanId, setEnrollPlanId] = useState("");

  const { data: plans } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: () => api.get<MembershipPlan[]>("/loyalty/plans/"),
    enabled: ready,
  });

  const { data: memberships } = useQuery({
    queryKey: ["customer-memberships"],
    queryFn: () => api.get<CustomerMembership[]>("/loyalty/memberships/"),
    enabled: ready,
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers/"),
    enabled: ready,
  });

  const createPlanMutation = useMutation({
    mutationFn: () =>
      api.post<MembershipPlan>("/loyalty/plans/", {
        name,
        description,
        discount_percent: discountPercent || "0",
        duration_days: Number(durationDays),
        price: price || "0",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
      setName("");
      setDescription("");
      setDiscountPercent("");
      setPrice("");
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/loyalty/plans/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["membership-plans"] }),
  });

  const enrollMutation = useMutation({
    mutationFn: () =>
      api.post<CustomerMembership>("/loyalty/memberships/", {
        customer: Number(enrollCustomerId),
        plan: Number(enrollPlanId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-memberships"] });
      setEnrollCustomerId("");
      setEnrollPlanId("");
    },
  });

  const cancelMembershipMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/loyalty/memberships/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer-memberships"] }),
  });

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <PageHeader title="Memberships" description="Manage plans and customer enrollments" />

        <Card className="mb-8 border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-xl italic">New Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createPlanMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gold Member" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-desc">Description</Label>
                <Textarea id="plan-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount %</Label>
                  <Input id="discount" type="number" step="0.01" min="0" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input id="duration" type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-price">Price (Rs.)</Label>
                  <Input id="plan-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>

              {createPlanMutation.isError && (
                <p className="text-sm text-destructive">
                  {createPlanMutation.error instanceof ApiError ? createPlanMutation.error.message : "Something went wrong."}
                </p>
              )}

              <Button type="submit" disabled={createPlanMutation.isPending}>
                <Plus className="mr-1.5 h-4 w-4" />
                {createPlanMutation.isPending ? "Saving..." : "Create Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="mb-4 font-heading text-xl italic text-foreground">Plans</h2>
        {plans && plans.length === 0 && (
          <EmptyState
            icon={Gift}
            title="No plans yet"
            description="Create your first membership plan above."
            actionLabel="Focus form"
            onAction={() => document.getElementById("plan-name")?.focus()}
          />
        )}
        {plans && plans.length > 0 && (
          <div className="mb-8 space-y-2">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.discount_percent}% off · {plan.duration_days} days · Rs. {plan.price}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete "${plan.name}"?`)) deletePlanMutation.mutate(plan.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Card className="mb-8 border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-xl italic">Enroll a Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enrollMutation.mutate();
              }}
              className="flex items-end gap-3"
            >
              <div className="flex-1 space-y-2">
                <Label>Customer</Label>
                <Select value={enrollCustomerId} onValueChange={setEnrollCustomerId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select customer">
                      {(value: string) => customers?.find((c) => String(c.id) === value)?.name ?? "Select customer"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Plan</Label>
                <Select value={enrollPlanId} onValueChange={setEnrollPlanId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select plan">
                      {(value: string) => plans?.find((p) => String(p.id) === value)?.name ?? "Select plan"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={!enrollCustomerId || !enrollPlanId || enrollMutation.isPending}>
                Enroll
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="mb-4 font-heading text-xl italic text-foreground">Enrollments</h2>
        {memberships && memberships.length === 0 && (
          <p className="text-sm text-muted-foreground">No customers enrolled yet.</p>
        )}
        {memberships && memberships.length > 0 && (
          <div className="space-y-2">
            {memberships.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">{m.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.plan_name} · expires {m.expires_at}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge active={m.is_active} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Cancel ${m.customer_name}'s membership?`)) cancelMembershipMutation.mutate(m.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}