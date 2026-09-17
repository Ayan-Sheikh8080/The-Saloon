"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { Customer, Staff, Service } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewAppointmentPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers/"),
    enabled: ready,
  });
  const { data: staffList } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get<Staff[]>("/staff/"),
    enabled: ready,
  });
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: () => api.get<Service[]>("/services/"),
    enabled: ready,
  });

  const canCheckAvailability = !!(staffId && serviceId && date);

  const { data: availability, isFetching: loadingSlots } = useQuery({
    queryKey: ["availability", staffId, serviceId, date],
    queryFn: () =>
      api.get<{ slots: string[] }>(
        `/appointments/availability/?staff=${staffId}&service=${serviceId}&date=${date}`
      ),
    enabled: ready && canCheckAvailability,
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.post("/appointments/", {
        customer: Number(customerId),
        staff: Number(staffId),
        service: Number(serviceId),
        start_at: selectedSlot,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      router.push("/appointments");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  if (!ready) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-8 py-10">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-2xl italic">New Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer">
                      {(value: string) =>
                        customers?.find((c) => String(c.id) === value)?.name ?? "Select a customer"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Staff</Label>
                <Select
                  value={staffId}
                  onValueChange={(v) => {
                    setStaffId(v);
                    setSelectedSlot("");
                  }}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a staff member">
                      {(value: string) =>
                        staffList?.find((s) => String(s.id) === value)?.name ?? "Select a staff member"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {staffList?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Service</Label>
                <Select
                  value={serviceId}
                  onValueChange={(v) => {
                    setServiceId(v);
                    setSelectedSlot("");
                  }}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a service">
                      {(value: string) => {
                        const svc = services?.find((s) => String(s.id) === value);
                        return svc ? `${svc.name} — ${svc.duration_minutes} min` : "Select a service";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — {s.duration_minutes} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedSlot("");
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring"
                />
              </div>

              {canCheckAvailability && (
                <div className="space-y-2">
                  <Label>Available times</Label>
                  {loadingSlots && (
                    <p className="text-sm text-muted-foreground">Checking availability...</p>
                  )}
                  {!loadingSlots && availability?.slots.length === 0 && (
                    <p className="text-sm text-muted-foreground">No slots available this day.</p>
                  )}
                  {!loadingSlots && availability && availability.slots.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {availability.slots.map((slot) => {
                        const time = new Date(slot).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-foreground hover:border-primary/60"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {mutation.isError && (
                <p className="text-sm text-destructive">
                  {mutation.error instanceof ApiError
                    ? mutation.error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={!customerId || !selectedSlot || mutation.isPending}
                  className="flex-1"
                >
                  {mutation.isPending ? "Booking..." : "Book appointment"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/appointments")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}