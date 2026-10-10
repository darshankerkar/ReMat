export interface Bin {
  id: string | number;
  name?: string;
  lat: number;
  lng: number;
  status?: "active" | "inactive" | "maintenance" | string;
  fill_level?: number;
  capacity?: number;
}


export interface DetectionResult {
  waste_type: string
  confidence: number
  base_points: number
  points_to_earn: number
  is_valid_e_waste?: boolean
  estimated_value?: number  // deprecated, use base_points
  details?: string
}


export type PickupStatus =
  | "open"
  | "accepted"
  | "rejected"
  | "cancelled";

export interface PickupRequest {
  id: string;
  image_url: string;
  e_waste_type: string;
  preferred_datetime: string;
  contact_number: string;
  status: PickupStatus;
  points_awarded?: number | null;
  rejection_reason?: string | null;
  address_text?: string | null;

  latitude?: number;
  longitude?: number;
  created_at: string;
}
