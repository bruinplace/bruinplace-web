import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryKeys } from "@/lib/query-keys";

export type Listing = {
  id: string;
  title: string;
  monthly_rent: number;
};

export type SampleData = {
  listings: Listing[];
  message: string;
};

export function useGetSampleData() {
  return useQuery({
    queryKey: [QueryKeys.TEST_SAMPLE],
    queryFn: () => api.get<SampleData>("/test/sample"),
  });
}
