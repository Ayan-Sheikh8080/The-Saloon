"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Service } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  const { ready, logout } = useAuthGuard();
  const router = useRouter();

  const { data: services, isLoading, isError } = useQuery({
    queryKey: ["services"],
    queryFn: () => api.get<Service[]>("/services/"),
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <a href="/customers" className="text-sm text-muted-foreground hover:text-foreground">Customers</a>
          <a href="/staff" className="text-sm text-muted-foreground hover:text-foreground">Staff</a>
          <a href="/services" className="text-sm text-foreground">Services</a>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl italic text-foreground">Services</h1>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/services/new")}>New Service</Button>
            <Button variant="outline" onClick={logout}>Sign out</Button>
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading services...</p>}
        {isError && <p className="text-destructive">Couldn&apos;t load services. Please try again.</p>}
        {services && services.length === 0 && (
          <p className="text-muted-foreground">No services yet. Add your first one to get started.</p>
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
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    onClick={() => router.push(`/services/${service.id}`)}
                    className="cursor-pointer border-t border-border hover:bg-accent/40"
                  >
                    <td className="px-4 py-3 text-foreground">{service.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{service.category || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">Rs. {service.price}</td>
                    <td className="px-4 py-3 text-muted-foreground">{service.duration_minutes} min</td>
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