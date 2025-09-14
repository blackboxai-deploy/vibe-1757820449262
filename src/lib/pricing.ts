import { Activity, Person, PricingBreakdown } from '@/types';

/**
 * Calculate the pricing breakdown for an activity based on participants
 */
export function calculateActivityPricing(activity: Activity, participants: Person[]): PricingBreakdown {
  const adults = participants.filter(p => p.type === 'adult' || p.type === 'senior').length;
  const children = participants.filter(p => p.type === 'child').length;
  const infants = participants.filter(p => p.type === 'infant').length;

  // Base pricing calculation
  const adultPrice = adults * activity.pricing.adu;
  const childPrice = children * activity.pricing.chd;
  const infantPrice = infants * activity.pricing.inf;
  
  const total = adultPrice + childPrice + infantPrice;

  // Calculate deposit if available
  let deposit = 0;
  let remaining = 0;
  
  if (activity.deposit) {
    const adultDeposit = adults * activity.deposit.adu;
    const childDeposit = children * activity.deposit.chd;
    const infantDeposit = infants * (activity.deposit.inf || 0);
    
    deposit = adultDeposit + childDeposit + infantDeposit;
    remaining = total - deposit;
  }

  return {
    adults: adultPrice,
    children: childPrice,
    infants: infantPrice,
    seniors: 0, // Seniors use adult pricing in this system
    total,
    deposit: deposit > 0 ? deposit : undefined,
    remaining: remaining > 0 ? remaining : undefined
  };
}

/**
 * Format currency in Brazilian Real
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

/**
 * Create participants array from form data
 */
export function createParticipants(adults: number, children: number, childrenAges: number[], hasSeniors: boolean): Person[] {
  const participants: Person[] = [];
  
  // Add adults (some might be seniors)
  const seniorCount = hasSeniors ? Math.min(adults, 2) : 0; // Assume max 2 seniors
  const regularAdults = adults - seniorCount;
  
  for (let i = 0; i < regularAdults; i++) {
    participants.push({ type: 'adult' });
  }
  
  for (let i = 0; i < seniorCount; i++) {
    participants.push({ type: 'senior' });
  }
  
  // Add children with their ages
  childrenAges.slice(0, children).forEach(age => {
    participants.push({ 
      type: age < 2 ? 'infant' : 'child',
      age 
    });
  });
  
  return participants;
}

/**
 * Validate if activity can be booked with given participants
 */
export function validateActivityBooking(activity: Activity, participants: Person[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const adults = participants.filter(p => p.type === 'adult' || p.type === 'senior').length;
  
  // Check minimum adults requirement
  if (adults < activity.min_adults) {
    errors.push(`Mínimo de ${activity.min_adults} adulto(s) necessário(s)`);
  }
  
  // Check maximum capacity
  if (participants.length > activity.max_capacity) {
    errors.push(`Capacidade máxima de ${activity.max_capacity} pessoas`);
  }
  
  // Special rules for certain activities
  if (activity.id === 'quadriciclo_praia' && participants.some(p => p.type === 'child' || p.type === 'infant')) {
    errors.push('Apenas adultos podem participar desta atividade');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check for scheduling conflicts between activities
 */
export function checkSchedulingConflicts(activities: Activity[]): string[] {
  const conflicts: string[] = [];
  const fullDayActivities = activities.filter(a => a.type === 'full_day');
  
  if (fullDayActivities.length > 1) {
    conflicts.push('Não é possível ter mais de uma atividade de dia inteiro no mesmo dia');
  }
  
  return conflicts;
}

/**
 * Calculate total trip pricing from multiple day itineraries
 */
export function calculateTripTotal(dayPricings: PricingBreakdown[]): PricingBreakdown {
  const total = dayPricings.reduce((sum, day) => sum + day.total, 0);
  const totalDeposit = dayPricings.reduce((sum, day) => sum + (day.deposit || 0), 0);
  const totalRemaining = dayPricings.reduce((sum, day) => sum + (day.remaining || 0), 0);
  
  return {
    adults: dayPricings.reduce((sum, day) => sum + day.adults, 0),
    children: dayPricings.reduce((sum, day) => sum + day.children, 0),
    infants: dayPricings.reduce((sum, day) => sum + day.infants, 0),
    seniors: dayPricings.reduce((sum, day) => sum + day.seniors, 0),
    total,
    deposit: totalDeposit > 0 ? totalDeposit : undefined,
    remaining: totalRemaining > 0 ? totalRemaining : undefined
  };
}