"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Scissors, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Service } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();

  const { data: services, isLoading, isError } = useQuery({
    queryKey: ["services"],
    queryFn: () => api.get<Service[]>("/services/"),
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <PageHeader
          title="Services"
          description={
            services ? `${services.length} service${services.length === 1 ? "" : "s"} offered` : undefined
          }
          action={
            <Button onClick={() => router.push("/services/new")}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Service
            </Button>
          }
        />

        {isLoading && <p className="text-muted-foreground">Loading services...</p>}
        {isError && <p className="text-destructive">Couldn&apos;t load services. Please try again.</p>}

        {services && services.length === 0 && (
          <EmptyState
            icon={Scissors}
            title="No services yet"
            description="Add the services your salon offers, with pricing and duration."
            actionLabel="Add Service"
            onAction={() => router.push("/services/new")}
          />
        )}

        {services && services.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    onClick={() => router.push(`/services/${service.id}`)}
                    className="cursor-pointer border-t border-border transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{service.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{service.category || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">Rs. {service.price}</td>
                    <td className="px-4 py-3 text-muted-foreground">{service.duration_minutes} min</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={service.is_active} />
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