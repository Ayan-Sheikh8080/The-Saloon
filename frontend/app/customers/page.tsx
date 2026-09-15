"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Customer } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const { ready, logout } = useAuthGuard();
  const router = useRouter();

  const { data: customers, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers/"),
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl italic text-foreground">
            Customers
          </h1>
                    <div className="flex gap-3">
            <Button onClick={() => router.push("/customers/new")}>
              New Customer
            </Button>
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>

        {isLoading && (
          <p className="text-muted-foreground">Loading customers...</p>
        )}

        {isError && (
          <p className="text-destructive">
            Couldn&apos;t load customers. Please try again.
          </p>
        )}

        {customers && customers.length === 0 && (
          <p className="text-muted-foreground">
            No customers yet. Add your first one to get started.
          </p>
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
                    className="cursor-pointer border-t border-border hover:bg-accent/40"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {customer.name}
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
    </div>
  );
}