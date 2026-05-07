export const SITE_NAME = 'Venue';

export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Sialkot',
  'Gujranwala',
  'Peshawar',
  'Quetta',
  'Sargodha',
  'Bahawalpur',
  'Mardan',
  'Sukkur',
  'Other',
] as const;

export const VENUE_TYPES = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'marquee', label: 'Marquee' },
] as const;

export const COMMON_FEATURES = [
  'AC',
  'Parking',
  'Generator',
  'Catering',
  'Bridal Room',
  'Stage',
  'Dance Floor',
  'WiFi',
  'Valet',
  'Garden',
];

export const BOOKING_SLOT_TYPES = [
  { value: 'morning' as const, label: 'Morning' },
  { value: 'afternoon' as const, label: 'Afternoon' },
  { value: 'evening' as const, label: 'Evening' },
  { value: 'full_day' as const, label: 'Full day' },
];

export const EVENT_TYPES = [
  { value: 'mehndi' as const, label: 'Mehndi' },
  { value: 'walima' as const, label: 'Walima' },
  { value: 'baraat' as const, label: 'Baraat' },
  { value: 'nikah' as const, label: 'Nikah' },
  { value: 'engagement' as const, label: 'Engagement' },
  { value: 'other' as const, label: 'Other' },
];
