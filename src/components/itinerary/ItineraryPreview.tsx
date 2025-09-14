"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type FormData, type Activity, type TripItinerary, type DayItinerary } from '@/types';
import { 
  formatCurrency, 
  calculateActivityPricing, 
  createParticipants, 
  calculateTripTotal 
} from '@/lib/pricing';
import { generateItineraryText } from '@/lib/textGenerator';

interface ItineraryPreviewProps {
  formData: FormData;
  activities: Activity[];
  onClose: () => void;
}

export function ItineraryPreview({ formData, onClose }: ItineraryPreviewProps) {
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [editableText, setEditableText] = useState('');
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (formData.dates && formData.accommodation) {
      generateItinerary();
    }
  }, [formData]);

  const generateItinerary = () => {
    if (!formData.dates || !formData.accommodation) return;

    const participants = createParticipants(
      formData.adults, 
      formData.children, 
      formData.childrenAges, 
      formData.hasSeniors
    );

    // Generate day itineraries
    const days: DayItinerary[] = [];
    const dayPricings = [];

    for (let dayNum = 1; dayNum <= formData.dates.days; dayNum++) {
      const dayActivities = formData.selectedActivities[dayNum] || [];
      const dayDate = new Date(formData.dates.arrival);
      dayDate.setDate(dayDate.getDate() + dayNum - 1);

      const selectedActivities = dayActivities.map(activity => ({
        activity,
        day: dayNum,
        participants
      }));

      // Calculate day pricing
      const dayTotal = dayActivities.reduce((total, activity) => {
        const pricing = calculateActivityPricing(activity, participants);
        return {
          adults: total.adults + pricing.adults,
          children: total.children + pricing.children,
          infants: total.infants + pricing.infants,
          seniors: total.seniors + pricing.seniors,
          total: total.total + pricing.total,
          deposit: (total.deposit || 0) + (pricing.deposit || 0),
          remaining: (total.remaining || 0) + (pricing.remaining || 0)
        };
      }, { adults: 0, children: 0, infants: 0, seniors: 0, total: 0, deposit: 0, remaining: 0 });

      const dayItinerary: DayItinerary = {
        day: dayNum,
        date: dayDate,
        activities: selectedActivities,
        pricing: {
          ...dayTotal,
          deposit: dayTotal.deposit > 0 ? dayTotal.deposit : undefined,
          remaining: dayTotal.remaining > 0 ? dayTotal.remaining : undefined
        }
      };

      days.push(dayItinerary);
      dayPricings.push(dayItinerary.pricing);
    }

    const tripItinerary: TripItinerary = {
      dates: formData.dates,
      accommodation: formData.accommodation,
      people: participants,
      days,
      totalPricing: calculateTripTotal(dayPricings),
      generatedText: ''
    };

    const generatedText = generateItineraryText(tripItinerary);
    tripItinerary.generatedText = generatedText;

    setItinerary(tripItinerary);
    setEditableText(generatedText);
  };

  const copyToClipboard = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(editableText);
      
      // Show success feedback
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopying(false);
    }
  };

  const formatPeopleCount = (people: any[]): string => {
    const adults = people.filter(p => p.type === 'adult').length;
    const seniors = people.filter(p => p.type === 'senior').length;
    const children = people.filter(p => p.type === 'child').length;
    const infants = people.filter(p => p.type === 'infant').length;

    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} ADU`);
    if (seniors > 0) parts.push(`${seniors} +60`);
    if (children > 0) parts.push(`${children} CHD`);
    if (infants > 0) parts.push(`${infants} INF`);

    return parts.join(' + ');
  };

  if (!itinerary) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4">Gerando roteiro...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">🗺️ Roteiro Gerado</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Preview Panel */}
          <div className="space-y-4">
            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="space-y-4 pr-4">
                {/* Trip Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Resumo da Viagem</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Período</p>
                      <p className="font-medium">
                        {itinerary.dates.arrival.toLocaleDateString('pt-BR')} até{' '}
                        {itinerary.dates.departure.toLocaleDateString('pt-BR')}
                      </p>
                      <Badge>{itinerary.dates.days} dias</Badge>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Hospedagem</p>
                      <p className="font-medium">{itinerary.accommodation.name}</p>
                      <p className="text-sm text-gray-500">{itinerary.accommodation.location}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Pessoas</p>
                      <p className="font-medium">{formatPeopleCount(itinerary.people)}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total da Viagem:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(itinerary.totalPricing.total)}
                        </span>
                      </div>

                      {itinerary.totalPricing.deposit && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Pré-reserva total:</span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(itinerary.totalPricing.deposit)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>A pagar nos dias:</span>
                            <span className="font-medium text-orange-600">
                              {formatCurrency(itinerary.totalPricing.remaining!)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Breakdown */}
                {itinerary.days.map(day => (
                  <Card key={day.day}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>📅 Dia {day.day} - {day.date.toLocaleDateString('pt-BR')}</span>
                        <Badge className="bg-green-600">
                          {formatCurrency(day.pricing.total)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {day.activities.length === 0 ? (
                        <p className="text-gray-500 italic">Dia livre</p>
                      ) : (
                        <>
                          {day.activities.map(selectedActivity => {
                            const activity = selectedActivity.activity;
                            const pricing = calculateActivityPricing(activity, itinerary.people);
                            
                            return (
                              <div key={activity.id} className="border-l-4 border-blue-500 pl-3 space-y-1">
                                <p className="font-medium">{activity.name}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  {activity.schedule && <span>🕐 {activity.schedule}</span>}
                                  <span>⏱️ {activity.duration}</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(pricing.total)}
                                  </span>
                                </div>
                                {activity.includes && activity.includes.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    ✅ Inclui: {activity.includes.join(', ')}
                                  </p>
                                )}
                              </div>
                            );
                          })}

                          {day.pricing.deposit && (
                            <div className="bg-blue-50 p-2 rounded text-sm">
                              <div className="flex justify-between">
                                <span>Pré-reserva do dia:</span>
                                <span className="font-medium">{formatCurrency(day.pricing.deposit)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>A pagar no local:</span>
                                <span className="font-medium">{formatCurrency(day.pricing.remaining!)}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Editable Text Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">📝 Roteiro Final</h3>
              <div className="space-x-2">
                <Button
                  onClick={copyToClipboard}
                  disabled={copying}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {copying ? '✅ Copiado!' : '📋 Copiar'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>

            <Textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="h-[calc(90vh-250px)] font-mono text-sm resize-none"
              placeholder="Texto do roteiro..."
            />

            <p className="text-xs text-gray-500">
              💡 Você pode editar o texto acima antes de copiar para WhatsApp ou outros aplicativos
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}