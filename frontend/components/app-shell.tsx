"use client";

import { usePathname, useRouter } from "next/navigation";
import { Users, UserRound, Scissors, Calendar, LogOut } from "lucide-react";
import { clearToken } from "@/lib/api";
import { useCurrentUser } from "@/lib/use-current-user";

const NAV_ITEMS = [
    { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/staff", label: "Staff", icon: UserRound },
  { href: "/services", label: "Services", icon: Scissors },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useCurrentUser();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6">
        <div className="mb-8 px-2">
          <h2 className="font-heading text-2xl italic text-sidebar-foreground">
            {me?.salon?.name ?? "The Saloon"}
          </h2>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-sidebar-border pt-4">
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-sidebar-foreground">
              {me?.user.username ?? "..."}
            </p>
            <p className="text-xs capitalize text-sidebar-foreground/60">
              {me?.role ?? ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}