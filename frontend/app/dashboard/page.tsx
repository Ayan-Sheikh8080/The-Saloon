"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DollarSign, Calendar, Users } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardData } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-chart-2/20 text-chart-2",
  checked_in: "bg-primary/20 text-primary",
  in_progress: "bg-primary/20 text-primary",
  completed: "bg-chart-2/20 text-chart-2",
  cancelled: "bg-destructive/20 text-destructive",
  no_show: "bg-destructive/20 text-destructive",
};

export default function DashboardPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/dashboard/"),
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <PageHeader title="Dashboard" description="Today's overview" />

        {isLoading && <p className="text-muted-foreground">Loading...</p>}

        {data && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Today&apos;s Revenue</span>
                </div>
                <p className="font-heading text-3xl italic text-foreground">
                  Rs. {data.today_revenue}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Today&apos;s Appointments</span>
                </div>
                <p className="font-heading text-3xl italic text-foreground">
                  {data.today_appointment_count}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Total Customers</span>
                </div>
                <p className="font-heading text-3xl italic text-foreground">
                  {data.total_customers}
                </p>
              </div>
            </div>

            <h2 className="mb-4 font-heading text-xl italic text-foreground">
              Recent Appointments
            </h2>
            <div className="space-y-2">
              {data.recent_appointments.length === 0 && (
                <p className="text-sm text-muted-foreground">No appointments yet.</p>
              )}
              {data.recent_appointments.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => router.push(`/appointments/${appt.id}`)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{appt.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {appt.service_name} with {appt.staff_name} — {formatTime(appt.start_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[appt.status]}`}
                  >
                    {appt.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}