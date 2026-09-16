"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Users, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Customer } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { AvatarCircle } from "@/components/avatar-circle";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();

  const { data: customers, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers/"),
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <PageHeader
          title="Customers"
          description={
            customers
              ? `${customers.length} customer${customers.length === 1 ? "" : "s"} on file`
              : undefined
          }
          action={
            <Button onClick={() => router.push("/customers/new")}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Customer
            </Button>
          }
        />

        {isLoading && <p className="text-muted-foreground">Loading customers...</p>}
        {isError && <p className="text-destructive">Couldn&apos;t load customers. Please try again.</p>}

        {customers && customers.length === 0 && (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to start building your client base."
            actionLabel="Add Customer"
            onAction={() => router.push("/customers/new")}
          />
        )}

        {customers && customers.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => router.push(`/customers/${customer.id}`)}
                    className="cursor-pointer border-t border-border transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarCircle name={customer.name} />
                        <span className="text-foreground">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {customer.email || "—"}
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