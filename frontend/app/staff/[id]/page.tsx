"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Staff } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/app-shell";

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ready } = useAuthGuard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => api.get<Staff>(`/staff/${id}/`),
    enabled: ready,
  });

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setTitle(member.title);
      setPhone(member.phone);
      setEmail(member.email);
      setIsActive(member.is_active);
    }
  }, [member]);

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch<Staff>(`/staff/${id}/`, { name, title, phone, email, is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      router.push("/staff");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/staff/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      router.push("/staff");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate();
  }

  function handleDelete() {
    if (confirm(`Delete ${member?.name}? This can't be undone.`)) {
      deleteMutation.mutate();
    }
  }

  if (!ready || isLoading) return null;

      return (
    <AppShell>
      <div className="mx-auto max-w-lg px-8 py-10">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-2xl italic">Edit Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label htmlFor="active">Active</Label>
                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              </div>

              {updateMutation.isError && (
                <p className="text-sm text-destructive">
                  {updateMutation.error instanceof ApiError ? updateMutation.error.message : "Something went wrong."}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/staff")}>Cancel</Button>
              </div>

              <Button type="button" variant="destructive" className="w-full" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : "Delete staff member"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}