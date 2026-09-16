"use client";

import { useQuery } from "@tanstack/react-query";
import { api, getToken } from "@/lib/api";
import { AuthResponse } from "@/lib/types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<Omit<AuthResponse, "token">>("/auth/me/"),
    enabled: !!getToken(),
  });
}