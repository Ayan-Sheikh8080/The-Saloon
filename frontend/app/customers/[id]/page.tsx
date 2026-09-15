"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Customer } from "@/lib/types";
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
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-lg">
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
      </div>
    </div>
  );
}