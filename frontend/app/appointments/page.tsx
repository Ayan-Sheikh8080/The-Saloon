"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { Appointment } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-chart-2/20 text-chart-2",
  checked_in: "bg-primary/20 text-primary",
  in_progress: "bg-primary/20 text-primary",
  completed: "bg-chart-2/20 text-chart-2",
  cancelled: "bg-destructive/20 text-destructive",
  no_show: "bg-destructive/20 text-destructive",
};

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AppointmentsPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = formatDate(selectedDate);

  const { data: appointments, isLoading, isError } = useQuery({
    queryKey: ["appointments", dateStr],
    queryFn: () => api.get<Appointment[]>(`/appointments/?date=${dateStr}`),
    enabled: ready,
  });

  function shiftDate(days: number) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  }

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <PageHeader
          title="Appointments"
          description={selectedDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => shiftDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => shiftDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => router.push("/appointments/new")}>
                <Plus className="mr-1.5 h-4 w-4" />
                New Appointment
              </Button>
            </div>
          }
        />

        {isLoading && <p className="text-muted-foreground">Loading appointments...</p>}
        {isError && <p className="text-destructive">Couldn&apos;t load appointments. Please try again.</p>}

        {appointments && appointments.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="No appointments today"
            description="Book an appointment to fill this day's schedule."
            actionLabel="New Appointment"
            onAction={() => router.push("/appointments/new")}
          />
        )}

        {appointments && appointments.length > 0 && (
          <div className="space-y-2">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                onClick={() => router.push(`/appointments/${appt.id}`)}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-foreground">
                    {formatTime(appt.start_at)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{appt.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {appt.service_name} with {appt.staff_name}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[appt.status]}`}
                >
                  {appt.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}