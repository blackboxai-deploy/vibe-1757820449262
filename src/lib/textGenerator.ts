import { TripItinerary, DayItinerary, Person, Activity } from '@/types';
import { formatCurrency } from './pricing';

/**
 * Generate the final itinerary text for sharing
 */
export function generateItineraryText(itinerary: TripItinerary): string {
  const { dates, accommodation, people, days, totalPricing } = itinerary;
  
  const arrivalDate = dates.arrival.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const departureDate = dates.departure.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  
  let text = `🗺️ ROTEIRO RESUMIDO — ${arrivalDate} a ${departureDate} (${dates.days} dias)\n`;
  text += `🏨 Hospedagem: ${accommodation.name}\n`;
  text += `👥 Pessoas: ${formatPeopleCount(people)}\n\n`;
  
  // Add daily activities
  days.forEach(day => {
    text += formatDayItinerary(day);
  });
  
  // Add totals
  text += `💰 TOTAL DA VIAGEM: ${formatCurrency(totalPricing.total)}\n`;
  
  if (totalPricing.deposit) {
    text += `📋 Pré-reserva total: ${formatCurrency(totalPricing.deposit)}\n`;
    text += `💳 A pagar nos dias: ${formatCurrency(totalPricing.remaining!)}\n`;
  }
  
  // Add general notes
  text += `\n📌 Observações gerais:\n`;
  text += `• Valores por pessoa conforme faixa etária\n`;
  text += `• Sem taxas extras de serviço\n`;
  text += `• Sujeito à disponibilidade no momento da reserva\n`;
  text += `• Levar protetor solar, chapéu e água\n`;
  text += `• Horários podem variar conforme condições climáticas\n\n`;
  
  text += `📱 Entre em contato para confirmar sua reserva!\n`;
  text += `Roteiro gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  
  return text;
}

/**
 * Format people count for display
 */
function formatPeopleCount(people: Person[]): string {
  const adults = people.filter(p => p.type === 'adult').length;
  const seniors = people.filter(p => p.type === 'senior').length;
  const children = people.filter(p => p.type === 'child').length;
  const infants = people.filter(p => p.type === 'infant').length;
  
  const parts: string[] = [];
  
  if (adults > 0) parts.push(`${adults} ADU`);
  if (seniors > 0) parts.push(`${seniors} +60`);
  if (children > 0) {
    const childAges = people
      .filter(p => p.type === 'child')
      .map(p => p.age)
      .join(', ');
    parts.push(`${children} CHD (${childAges} anos)`);
  }
  if (infants > 0) parts.push(`${infants} INF`);
  
  return parts.join(' + ');
}

/**
 * Format a single day itinerary
 */
function formatDayItinerary(day: DayItinerary): string {
  const dayNumber = day.day;
  const dayDate = day.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  let text = `📅 DIA ${dayNumber} — ${dayDate}\n`;
  
  if (day.activities.length === 0) {
    text += `• Dia livre\n\n`;
    return text;
  }
  
  day.activities.forEach(selectedActivity => {
    const activity = selectedActivity.activity;
    text += `🎯 ${activity.name}\n`;
    
    if (activity.schedule) {
      text += `🕐 ${activity.schedule}\n`;
    }
    
    if (activity.duration) {
      text += `⏱️ Duração: ${activity.duration}\n`;
    }
  });
  
  // Add pricing info for the day
  text += `💰 Total do dia: ${formatCurrency(day.pricing.total)}`;
  
  if (day.pricing.deposit) {
    text += ` (Pré-reserva ${formatCurrency(day.pricing.deposit)} | No dia ${formatCurrency(day.pricing.remaining!)})`;
  }
  
  text += `\n`;
  
  // Add activity details
  day.activities.forEach(selectedActivity => {
    const activity = selectedActivity.activity;
    
    if (activity.includes && activity.includes.length > 0) {
      text += `✅ Inclui: ${activity.includes.join(', ')}\n`;
    }
    
    if (activity.excludes && activity.excludes.length > 0) {
      text += `❌ Não inclui: ${activity.excludes.join(', ')}\n`;
    }
    
    if (activity.requirements && activity.requirements.length > 0) {
      text += `⚠️ Requisitos: ${activity.requirements.join(', ')}\n`;
    }
  });
  
  text += `\n`;
  
  return text;
}

/**
 * Generate activity summary for preview
 */
export function generateActivitySummary(activity: Activity, participants: Person[]): string {
  let summary = `${activity.name}\n`;
  summary += `👥 ${formatPeopleCount(participants)}\n`;
  summary += `⏱️ ${activity.duration}\n`;
  
  if (activity.schedule) {
    summary += `🕐 ${activity.schedule}\n`;
  }
  
  return summary;
}

/**
 * Generate quick pricing preview
 */
export function generatePricingPreview(total: number, deposit?: number, remaining?: number): string {
  let preview = `💰 Total: ${formatCurrency(total)}`;
  
  if (deposit && remaining) {
    preview += `\n📋 Pré-reserva: ${formatCurrency(deposit)}`;
    preview += `\n💳 No local: ${formatCurrency(remaining)}`;
  }
  
  return preview;
}