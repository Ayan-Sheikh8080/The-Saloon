"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircleHeart, Copy, Check, Settings } from "lucide-react";
import { api } from "@/lib/api";
import { RebookingCustomer, MessageTemplate } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RetentionPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();
  const [templateId, setTemplateId] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["message-templates"],
    queryFn: () => api.get<MessageTemplate[]>("/marketing/templates/"),
    enabled: ready,
  });

  const { data: dueCustomers, isLoading } = useQuery({
    queryKey: ["due-for-rebooking", templateId],
    queryFn: () =>
      api.get<RebookingCustomer[]>(
        `/customers/due-for-rebooking/${templateId ? `?template=${templateId}` : ""}`
      ),
    enabled: ready,
  });

  function copyMessage(id: number, message: string) {
    navigator.clipboard.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <PageHeader
          title="Retention"
          description={
            dueCustomers
              ? `${dueCustomers.length} customer${dueCustomers.length === 1 ? "" : "s"} due for rebooking`
              : undefined
          }
            action={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/retention/templates")}>
                <Settings className="mr-1.5 h-4 w-4" />
                Manage Templates
              </Button>
              {templates && templates.length > 0 && (
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="No message template">
                    {(value: string) =>
                      templates.find((t) => String(t.id) === value)?.name ?? "No message template"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
             )}
            </div>
            }
            />

        {isLoading && <p className="text-muted-foreground">Checking customer history...</p>}

        {dueCustomers && dueCustomers.length === 0 && (
          <EmptyState
            icon={MessageCircleHeart}
            title="Everyone's up to date"
            description="No customers are currently overdue for a rebooking."
            actionLabel="Refresh"
            onAction={() => {}}
          />
        )}

        {dueCustomers && dueCustomers.length > 0 && (
          <div className="space-y-3">
            {dueCustomers.map((c) => (
              <div key={c.customer_id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{c.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last visit {c.last_visit} · usually returns every ~{c.average_interval_days} days ·{" "}
                      <span className="text-destructive">{c.days_overdue} days overdue</span>
                    </p>
                  </div>
                </div>

                {c.draft_message && (
                  <div className="mt-3 flex items-start gap-2 rounded-md bg-secondary p-3">
                    <p className="flex-1 text-sm text-secondary-foreground">{c.draft_message}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => copyMessage(c.customer_id, c.draft_message!)}
                    >
                      {copiedId === c.customer_id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}