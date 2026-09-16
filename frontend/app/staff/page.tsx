"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { UserRound, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Staff } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { AvatarCircle } from "@/components/avatar-circle";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export default function StaffPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get<Staff[]>("/staff/"),
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <PageHeader
          title="Staff"
          description={
            staff ? `${staff.length} team member${staff.length === 1 ? "" : "s"}` : undefined
          }
          action={
            <Button onClick={() => router.push("/staff/new")}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Staff
            </Button>
          }
        />

        {isLoading && <p className="text-muted-foreground">Loading staff...</p>}
        {isError && <p className="text-destructive">Couldn&apos;t load staff. Please try again.</p>}

        {staff && staff.length === 0 && (
          <EmptyState
            icon={UserRound}
            title="No staff yet"
            description="Add your team members to start assigning appointments."
            actionLabel="Add Staff"
            onAction={() => router.push("/staff/new")}
          />
        )}

        {staff && staff.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => router.push(`/staff/${member.id}`)}
                    className="cursor-pointer border-t border-border transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarCircle name={member.name} />
                        <span className="text-foreground">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{member.title || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{member.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={member.is_active} />
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