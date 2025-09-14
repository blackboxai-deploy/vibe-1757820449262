"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { type Activity, type FormData, ActivityCategory } from '@/types';
import { formatCurrency, calculateActivityPricing, createParticipants, validateActivityBooking } from '@/lib/pricing';

interface ActivitySelectorProps {
  activities: Activity[];
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function ActivitySelector({ activities, formData, updateFormData }: ActivitySelectorProps) {
  const [selectedDay, setSelectedDay] = useState(1);

  const categories: { id: ActivityCategory; label: string; icon: string }[] = [
    { id: 'mais_procurados', label: 'Mais Procurados', icon: '⭐' },
    { id: 'experiencias', label: 'Experiências', icon: '🌟' },
    { id: 'maritimos', label: 'Marítimos', icon: '🚤' },
    { id: 'quadriciclos', label: 'Quadriciclos', icon: '🏍️' },
    { id: 'privativos', label: 'Privativos', icon: '👑' },
    { id: 'pacotes', label: 'Pacotes', icon: '📦' },
    { id: 'transfers', label: 'Transfers', icon: '🚗' }
  ];

  const getDaysArray = (): number[] => {
    if (!formData.dates) return [1];
    return Array.from({ length: formData.dates.days }, (_, i) => i + 1);
  };

  const getActivitiesByCategory = (category: ActivityCategory): Activity[] => {
    return activities.filter(activity => activity.category === category);
  };

  const isActivitySelected = (activityId: string, day: number): boolean => {
    const dayActivities = formData.selectedActivities[day] || [];
    return dayActivities.some(activity => activity.id === activityId);
  };

  const toggleActivity = (activity: Activity, day: number) => {
    const currentDayActivities = formData.selectedActivities[day] || [];
    const isCurrentlySelected = currentDayActivities.some(a => a.id === activity.id);

    let newDayActivities: Activity[];
    if (isCurrentlySelected) {
      // Remove activity
      newDayActivities = currentDayActivities.filter(a => a.id !== activity.id);
    } else {
      // Add activity with validation
      const participants = createParticipants(formData.adults, formData.children, formData.childrenAges, formData.hasSeniors);
      const validation = validateActivityBooking(activity, participants);
      
      if (!validation.valid) {
        // Could show a toast/alert here
        console.warn('Activity validation failed:', validation.errors);
        return;
      }

      // Check for scheduling conflicts
      const hasFullDayConflict = currentDayActivities.some(a => a.type === 'full_day') && activity.type === 'full_day';
      if (hasFullDayConflict) {
        console.warn('Cannot add two full-day activities on the same day');
        return;
      }

      newDayActivities = [...currentDayActivities, activity];
    }

    updateFormData({
      selectedActivities: {
        ...formData.selectedActivities,
        [day]: newDayActivities
      }
    });
  };

  const getActivityPricing = (activity: Activity) => {
    const participants = createParticipants(formData.adults, formData.children, formData.childrenAges, formData.hasSeniors);
    return calculateActivityPricing(activity, participants);
  };

  const getDayTotal = (day: number): number => {
    const dayActivities = formData.selectedActivities[day] || [];
    return dayActivities.reduce((total, activity) => {
      const pricing = getActivityPricing(activity);
      return total + pricing.total;
    }, 0);
  };

  const getTotalSelectedActivities = (): number => {
    return Object.values(formData.selectedActivities).reduce((total: number, dayActivities: Activity[]) => {
      return total + dayActivities.length;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector */}
      {formData.dates && formData.dates.days > 1 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📅</span>
                <p className="font-medium text-blue-800">Selecionar Dia da Viagem</p>
              </div>
              <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getDaysArray().map(day => {
                    const dayActivities = formData.selectedActivities[day] || [];
                    const dayTotal = getDayTotal(day);
                    return (
                      <SelectItem key={day} value={day.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>Dia {day}</span>
                          {dayActivities.length > 0 && (
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge variant="secondary" className="text-xs">
                                {dayActivities.length} atividades
                              </Badge>
                              <span className="text-xs font-medium text-green-600">
                                {formatCurrency(dayTotal)}
                              </span>
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Activities Summary */}
      {getTotalSelectedActivities() > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">✅</span>
                <p className="font-medium text-green-800">Atividades Selecionadas</p>
              </div>
              <div className="space-y-2">
                {getDaysArray().map(day => {
                  const dayActivities = formData.selectedActivities[day] || [];
                  if (dayActivities.length === 0) return null;
                  
                  return (
                    <div key={day} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">Dia {day}</p>
                        <Badge className="bg-green-600 text-white text-xs">
                          {formatCurrency(getDayTotal(day))}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {dayActivities.map(activity => (
                          <div key={activity.id} className="flex items-center justify-between text-xs">
                            <span>{activity.name}</span>
                            <span className="text-gray-500">{formatCurrency(getActivityPricing(activity).total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            🎯 Atividades - Dia {selectedDay}
            {formData.selectedActivities[selectedDay]?.length > 0 && (
              <Badge className="ml-2">
                {formData.selectedActivities[selectedDay].length} selecionadas
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Selecione as atividades e passeios para este dia da viagem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mais_procurados">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <span className="mr-1">{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getActivitiesByCategory(category.id).map(activity => {
                    const pricing = getActivityPricing(activity);
                    const isSelected = isActivitySelected(activity.id, selectedDay);
                    const participants = createParticipants(formData.adults, formData.children, formData.childrenAges, formData.hasSeniors);
                    const validation = validateActivityBooking(activity, participants);

                    return (
                      <Card 
                        key={activity.id} 
                        className={`cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'border-green-500 bg-green-50' 
                            : 'hover:border-blue-300 hover:shadow-md'
                        }`}
                        onClick={() => toggleActivity(activity, selectedDay)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="pointer-events-none"
                                  />
                                  <h3 className="font-medium text-sm leading-tight">
                                    {activity.name}
                                  </h3>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {activity.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Badge variant="outline" className="text-xs">
                                {activity.type === 'full_day' ? 'Dia Inteiro' : 
                                 activity.type === 'half_day' ? 'Meio Dia' :
                                 activity.type === 'transfer' ? 'Transfer' : 'Experiência'}
                              </Badge>
                              <span>⏱️ {activity.duration}</span>
                              {activity.schedule && (
                                <span className="truncate">🕐 {activity.schedule}</span>
                              )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total:</span>
                                <span className="font-bold text-green-600">
                                  {formatCurrency(pricing.total)}
                                </span>
                              </div>
                              
                              {pricing.deposit && (
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Pré-reserva:</span>
                                    <span>{formatCurrency(pricing.deposit)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>No local:</span>
                                    <span>{formatCurrency(pricing.remaining!)}</span>
                                  </div>
                                </div>
                              )}

                              {!validation.valid && (
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                  ⚠️ {validation.errors[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {getActivitiesByCategory(category.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma atividade disponível nesta categoria</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Day Navigation for multi-day trips */}
      {formData.dates && formData.dates.days > 1 && (
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
            disabled={selectedDay === 1}
          >
            ← Dia Anterior
          </Button>
          <Button 
            variant="outline"
            onClick={() => setSelectedDay(Math.min(formData.dates!.days, selectedDay + 1))}
            disabled={selectedDay === formData.dates.days}
          >
            Próximo Dia →
          </Button>
        </div>
      )}
    </div>
  );
}