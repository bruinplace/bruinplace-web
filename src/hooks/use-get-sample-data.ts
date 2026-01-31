import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Listing = {
  id: string;
  title: string;
  monthly_rent: number;
};

export type SampleData = {
  listings: Listing[];
  message: string;
};

const queryKey = ["api", "sample"] as const;

export function useGetSampleData() {
  return useQuery({
    queryKey: [...queryKey],
    queryFn: () => api.get<SampleData>("/test/sample"),
  });
}
