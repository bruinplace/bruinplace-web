import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QueryKeys } from "../lib/query-keys";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  profile_picture: string | null;
};

export function useAuthMe() {
  return useQuery({
    queryKey: [QueryKeys.AUTH_ME],
    queryFn: () => api.get<AuthUser>("/auth/me"),
    retry: false,
  });
}
