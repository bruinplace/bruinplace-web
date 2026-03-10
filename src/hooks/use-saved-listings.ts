import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryKeys } from "@/lib/query-keys";

export type SavedListing = {
  id: string;
  property_id: string;
  user_id: string;
  title: string;
  description: string;
  monthly_rent: number;
  deposit_amount: number | null;
  available_from: string | null;
  lease_term_months: number | null;
  lease_type: string | null;
  unit_type: string;
  square_feet: number | null;
  max_occupants: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SavedListingsResponse = {
  items: SavedListing[];
  total: number;
};

export function useSavedListings() {
  return useQuery({
    queryKey: [QueryKeys.SAVED_LISTINGS],
    queryFn: () => api.get<SavedListingsResponse>("/me/saved-listings"),
    retry: false,
  });
}
