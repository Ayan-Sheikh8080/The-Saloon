"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { MessageTemplate } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MessageTemplatesPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["message-templates"],
    queryFn: () => api.get<MessageTemplate[]>("/marketing/templates/"),
    enabled: ready,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<MessageTemplate>("/marketing/templates/", { name, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      setName("");
      setBody("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/marketing/templates/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-8 py-10">
        <PageHeader
          title="Message Templates"
          description="Draft reusable messages for customer outreach"
          action={
            <Button variant="outline" onClick={() => router.push("/retention")}>
              Back to Retention
            </Button>
          }
        />

        <Card className="mb-8 border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-xl italic">New Template</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rebooking Reminder"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Hi {customer_name}! It's been a while since your last visit to {salon_name}..."
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use <code className="rounded bg-secondary px-1">{"{customer_name}"}</code> and{" "}
                  <code className="rounded bg-secondary px-1">{"{salon_name}"}</code> as placeholders.
                </p>
              </div>

              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {createMutation.error instanceof ApiError
                    ? createMutation.error.message
                    : "Something went wrong."}
                </p>
              )}

              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Create Template"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="mb-4 font-heading text-xl italic text-foreground">Your Templates</h2>

        {isLoading && <p className="text-muted-foreground">Loading...</p>}

        {templates && templates.length === 0 && (
          <EmptyState
            icon={MessageSquarePlus}
            title="No templates yet"
            description="Create your first template above."
            actionLabel="Focus form"
            onAction={() => document.getElementById("name")?.focus()}
          />
        )}

        {templates && templates.length > 0 && (
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-foreground">{t.name}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete "${t.name}"?`)) {
                        deleteMutation.mutate(t.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{t.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}