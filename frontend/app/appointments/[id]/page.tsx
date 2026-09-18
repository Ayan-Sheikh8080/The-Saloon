"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Appointment, AppointmentStatus } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_FLOW: { value: AppointmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready } = useAuthGuard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: appt, isLoading } = useQuery({
    queryKey: ["appointments", id],
    queryFn: () => api.get<Appointment>(`/appointments/${id}/`),
    enabled: ready,
  });

  const statusMutation = useMutation({
    mutationFn: (status: AppointmentStatus) =>
      api.patch<Appointment>(`/appointments/${id}/`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      api.patch<Appointment>(`/appointments/${id}/`, { status: "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      router.push("/appointments");
    },
  });

  const noShowMutation = useMutation({
    mutationFn: () =>
      api.patch<Appointment>(`/appointments/${id}/`, { status: "no_show" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      router.push("/appointments");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/appointments/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      router.push("/appointments");
    },
  });

  if (!ready || isLoading || !appt) return null;

  const isFinal = ["completed", "cancelled", "no_show"].includes(appt.status);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-8 py-10">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-2xl italic">
              {appt.customer_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {appt.service_name} with {appt.staff_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(appt.start_at).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusMutation.isError && (
              <p className="text-sm text-destructive">
                {statusMutation.error instanceof ApiError
                  ? statusMutation.error.message
                  : "Something went wrong."}
              </p>
            )}

            {!isFinal && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Update status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map((s) => (
                    <Button
                      key={s.value}
                      type="button"
                      size="sm"
                      variant={appt.status === s.value ? "default" : "outline"}
                      onClick={() => statusMutation.mutate(s.value)}
                      disabled={statusMutation.isPending}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {isFinal && (
              <div className="space-y-3">
                <p className="text-sm capitalize text-muted-foreground">
                  Status: {appt.status.replace("_", " ")}
                </p>
                {appt.status === "completed" && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => router.push(`/checkout/${appt.id}`)}
                  >
                    Go to Checkout
                  </Button>
                )}
              </div>
            )}

            {!isFinal && (
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => noShowMutation.mutate()}
                  disabled={noShowMutation.isPending}
                >
                  Mark No-Show
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/appointments")}
            >
              Back to Appointments
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm("Delete this appointment permanently?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}