export type UserRole = 'customer' | 'vendor' | 'admin';
export type VendorType = 'venue' | 'photographer' | 'decorator' | 'makeup_artist' | 'catering';
export type VenueType = 'indoor' | 'outdoor' | 'farmhouse' | 'marquee';
export type BookingSlotType = 'morning' | 'afternoon' | 'evening' | 'full_day'; // deprecated: use VenueSlot

export interface VenueSlot {
  id: string;
  venue_id: string;
  name: string;
  start_time: string; // "HH:mm" or "HH:mm:ss"
  end_time: string;
  display_order: number;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  vendor_type: VendorType;
  city: string;
  description: string | null;
  is_verified: boolean;
  notification_email: string | null;
  created_at: string;
}

export interface Venue {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  city: string;
  area: string | null;
  min_price: number | null;
  max_price: number | null;
  capacity: number | null;
  venue_type: VenueType;
  description: string | null;
  address: string | null;
  google_maps_link: string | null;
  is_featured: boolean;
  is_verified: boolean;
  catering_included: boolean;
  min_per_head_price: number | null;
  max_per_head_price: number | null;
  per_head_with_catering_min: number | null;
  per_head_with_catering_max: number | null;
  per_head_without_catering_min: number | null;
  per_head_without_catering_max: number | null;
  view_count?: number;
  impression_count?: number;
  wishlist_count?: number;
  created_at: string;
}

export interface VenueCateringPackage {
  id: string;
  venue_id: string;
  name: string;
  per_head_price: number;
  description: string | null;
  menu_text: string | null;
  display_order: number;
}

export interface VenueFloor {
  id: string;
  venue_id: string;
  name: string;
  capacity: number | null;
  display_order: number;
}

export interface VenueFeature {
  id: string;
  venue_id: string;
  feature_name: string;
}

export interface VenueImage {
  id: string;
  venue_id: string;
  image_url: string;
  display_order: number;
}

export interface VenueVideo {
  id: string;
  venue_id: string;
  video_url: string;
  display_order: number;
}

export interface VenueBookingSlot {
  id: string;
  venue_id: string;
  slot_type: BookingSlotType;
}

export interface VenueSlotBlock {
  id: string;
  venue_id: string;
  slot_date: string;
  venue_slot_id: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  venue_id: string;
  name: string;
  phone: string;
  event_date: string | null;
  message: string | null;
  preferred_slot: BookingSlotType | null; // deprecated: use preferred_slot_id
  preferred_slot_id: string | null;
  interested_package_id: string | null;
  floor_id: string | null;
  event_type: InquiryEventType | null;
  status: InquiryStatus;
  expected_price: number | null;
  source: InquirySource;
  created_at: string;
}

export type InquiryEventType = 'mehndi' | 'walima' | 'baraat' | 'nikah' | 'engagement' | 'other';

export type InquiryStatus = 'new' | 'contacted' | 'negotiating' | 'confirmed' | 'lost';
export type InquirySource = 'marketplace' | 'walk_in' | 'phone' | 'referral';

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  vendor_id: string;
  note: string;
  created_at: string;
}

export interface VenueReview {
  id: string;
  venue_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  vendor_id: string;
  venue_id: string;
  inquiry_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  event_type: InquiryEventType | null;
  guest_count: number | null;
  event_date: string;
  venue_slot_id: string | null;
  selected_floor: string | null;
  selected_package: string | null;
  total_amount: number | null;
  advance_paid: number;
  booking_status: BookingStatus;
  notes: string | null;
  created_at: string;
}

export type NotificationType = 'new_inquiry' | 'booking_confirmed' | 'event_reminder';

export interface Notification {
  id: string;
  vendor_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export interface VenueWithRelations extends Venue {
  venue_features: VenueFeature[];
  venue_images: VenueImage[];
  venue_catering_packages?: VenueCateringPackage[];
  venue_floors?: VenueFloor[];
  venue_booking_slots?: VenueBookingSlot[];
  venue_slots?: VenueSlot[];
  venue_videos?: VenueVideo[];
  vendors?: Pick<Vendor, 'business_name' | 'is_verified'> | null;
}
