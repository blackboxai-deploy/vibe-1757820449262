// Core data types for the travel itinerary builder

export interface Accommodation {
  id: string;
  name: string;
  location: string;
  type?: string;
}

export interface ActivityPricing {
  adu: number; // Adult price
  chd: number; // Child price
  inf: number; // Infant price (usually 0)
}

export interface ActivityDeposit {
  adu: number;
  chd: number;
  inf?: number;
}

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  type: 'full_day' | 'half_day' | 'transfer' | 'experience';
  duration: string;
  pricing: ActivityPricing;
  deposit?: ActivityDeposit;
  min_adults: number;
  max_capacity: number;
  description: string;
  requirements?: string[];
  schedule?: string;
  includes?: string[];
  excludes?: string[];
}

export type ActivityCategory = 
  | 'mais_procurados' 
  | 'privativos' 
  | 'pacotes' 
  | 'maritimos' 
  | 'quadriciclos' 
  | 'experiencias' 
  | 'transfers';

export interface Person {
  type: 'adult' | 'child' | 'infant' | 'senior';
  age?: number;
}

export interface TripDates {
  arrival: Date;
  departure: Date;
  days: number;
}

export interface SelectedActivity {
  activity: Activity;
  day: number;
  participants: Person[];
}

export interface PricingBreakdown {
  adults: number;
  children: number;
  infants: number;
  seniors: number;
  total: number;
  deposit?: number;
  remaining?: number;
}

export interface DayItinerary {
  day: number;
  date: Date;
  activities: SelectedActivity[];
  pricing: PricingBreakdown;
}

export interface TripItinerary {
  dates: TripDates;
  accommodation: Accommodation;
  people: Person[];
  days: DayItinerary[];
  totalPricing: PricingBreakdown;
  generatedText: string;
}

export interface FormData {
  dates?: TripDates;
  accommodation?: Accommodation;
  adults: number;
  children: number;
  childrenAges: number[];
  hasSeniors: boolean;
  selectedActivities: { [day: number]: Activity[] };
}