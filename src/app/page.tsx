"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DateSelector } from '@/components/itinerary/DateSelector';
import { AccommodationSelector } from '@/components/itinerary/AccommodationSelector';
import { PeopleSelector } from '@/components/itinerary/PeopleSelector';
import { ActivitySelector } from '@/components/itinerary/ActivitySelector';
import { ItineraryPreview } from '@/components/itinerary/ItineraryPreview';
import { type FormData, type Accommodation, type Activity } from '@/types';
import { formatCurrency } from '@/lib/pricing';

export default function ItineraryBuilderPage() {
  const [formData, setFormData] = useState<FormData>({
    adults: 2,
    children: 0,
    childrenAges: [],
    hasSeniors: false,
    selectedActivities: {}
  });
  
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accommodationsRes, activitiesRes] = await Promise.all([
          fetch('/api/lodgings'),
          fetch('/api/activities')
        ]);
        
        const accommodationsData = await accommodationsRes.json();
        const activitiesData = await activitiesRes.json();
        
        setAccommodations(accommodationsData.accommodations || []);
        setActivities(activitiesData.activities || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: return !!formData.dates;
      case 2: return !!formData.accommodation;
      case 3: return formData.adults > 0;
      case 4: return Object.keys(formData.selectedActivities).length > 0;
      default: return false;
    }
  };

  const canGenerateItinerary = (): boolean => {
    return !!(formData.dates && 
           formData.accommodation && 
           formData.adults > 0 && 
           Object.keys(formData.selectedActivities).length > 0);
  };

  const resetForm = () => {
    setFormData({
      adults: 2,
      children: 0,
      childrenAges: [],
      hasSeniors: false,
      selectedActivities: {}
    });
    setCurrentStep(1);
    setShowPreview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🗺️ Construtor de Roteiros
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Monte seu roteiro de viagem personalizado com preços em tempo real
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                ${isStepComplete(step) ? 'bg-green-600' : ''}
              `}>
                {isStepComplete(step) ? '✓' : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-0.5 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Date Selection */}
          <Card className={currentStep === 1 ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center">
                📅 1. Selecionar Datas
                {isStepComplete(1) && <Badge className="ml-2" variant="secondary">Completo</Badge>}
              </CardTitle>
              <CardDescription>
                Escolha as datas de chegada e partida da sua viagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DateSelector
                formData={formData}
                updateFormData={updateFormData}
                onNext={() => setCurrentStep(2)}
              />
            </CardContent>
          </Card>

          {/* Step 2: Accommodation */}
          <Card className={currentStep === 2 ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center">
                🏨 2. Escolher Hospedagem
                {isStepComplete(2) && <Badge className="ml-2" variant="secondary">Completo</Badge>}
              </CardTitle>
              <CardDescription>
                Selecione onde você ficará hospedado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccommodationSelector
                accommodations={accommodations}
                formData={formData}
                updateFormData={updateFormData}
                onNext={() => setCurrentStep(3)}
              />
            </CardContent>
          </Card>

          {/* Step 3: People */}
          <Card className={currentStep === 3 ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center">
                👥 3. Quantidade de Pessoas
                {isStepComplete(3) && <Badge className="ml-2" variant="secondary">Completo</Badge>}
              </CardTitle>
              <CardDescription>
                Defina quantas pessoas participarão da viagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PeopleSelector
                formData={formData}
                updateFormData={updateFormData}
                onNext={() => setCurrentStep(4)}
              />
            </CardContent>
          </Card>

          {/* Step 4: Activities */}
          <Card className={currentStep === 4 ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center">
                🎯 4. Selecionar Atividades
                {isStepComplete(4) && <Badge className="ml-2" variant="secondary">Completo</Badge>}
              </CardTitle>
              <CardDescription>
                Escolha as atividades e passeios para cada dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivitySelector
                activities={activities}
                formData={formData}
                updateFormData={updateFormData}
              />
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => setShowPreview(true)}
              disabled={!canGenerateItinerary()}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
            >
              🗺️ Gerar Roteiro
            </Button>
            <Button 
              onClick={resetForm}
              variant="outline"
              size="lg"
              className="px-8 py-3"
            >
              🔄 Resetar
            </Button>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle>📊 Resumo da Viagem</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.dates && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Período</p>
                    <p className="font-medium">
                      {formData.dates.arrival.toLocaleDateString()} até {formData.dates.departure.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-blue-600">{formData.dates.days} dias</p>
                  </div>
                )}

                {formData.accommodation && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Hospedagem</p>
                    <p className="font-medium">{formData.accommodation.name}</p>
                    <p className="text-sm text-gray-500">{formData.accommodation.location}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Pessoas</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.adults > 0 && (
                      <Badge variant="outline">{formData.adults} Adultos</Badge>
                    )}
                    {formData.children > 0 && (
                      <Badge variant="outline">{formData.children} Crianças</Badge>
                    )}
                    {formData.hasSeniors && (
                      <Badge variant="outline">+60 anos</Badge>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Atividades Selecionadas</p>
                  <p className="font-medium">
                    {Object.values(formData.selectedActivities).flat().length} atividades
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="text-center">
                  <p className="text-sm text-gray-600">Valor estimado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(0)} {/* Will be calculated dynamically */}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Itinerary Preview Modal */}
      {showPreview && (
        <ItineraryPreview
          formData={formData}
          activities={activities}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}