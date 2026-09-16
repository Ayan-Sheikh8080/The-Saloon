"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Staff } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";

export default function StaffPage() {
  const { ready, logout } = useAuthGuard();
  const router = useRouter();

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get<Staff[]>("/staff/"),
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <a href="/customers" className="text-sm text-muted-foreground hover:text-foreground">Customers</a>
          <a href="/staff" className="text-sm text-foreground">Staff</a>
          <a href="/services" className="text-sm text-muted-foreground hover:text-foreground">Services</a>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl italic text-foreground">Staff</h1>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/staff/new")}>New Staff</Button>
            <Button variant="outline" onClick={logout}>Sign out</Button>
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading staff...</p>}
        {isError && <p className="text-destructive">Couldn&apos;t load staff. Please try again.</p>}
        {staff && staff.length === 0 && (
          <p className="text-muted-foreground">No staff yet. Add your first one to get started.</p>
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
                    className="cursor-pointer border-t border-border hover:bg-accent/40"
                  >
                    <td className="px-4 py-3 text-foreground">{member.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{member.title || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{member.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={member.is_active ? "text-foreground" : "text-muted-foreground"}>
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
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