"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { type Accommodation, type FormData } from '@/types';

interface AccommodationSelectorProps {
  accommodations: Accommodation[];
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}

export function AccommodationSelector({ 
  accommodations, 
  formData, 
  updateFormData, 
  onNext 
}: AccommodationSelectorProps) {
  const selectedAccommodationId = formData.accommodation ? formData.accommodation.id : "";

  const handleAccommodationChange = (accommodationId: string) => {
    const selectedAccommodation = accommodations.find(acc => acc.id === accommodationId);
    if (selectedAccommodation) {
      updateFormData({ accommodation: selectedAccommodation });
    }
  };

  const getAccommodationTypeLabel = (type?: string) => {
    const typeLabels: { [key: string]: string } = {
      resort: 'Resort',
      pousada: 'Pousada',
      hotel: 'Hotel',
      eco_resort: 'Eco Resort'
    };
    return typeLabels[type || ''] || 'Hotel';
  };

  const getAccommodationTypeColor = (type?: string) => {
    const colors: { [key: string]: string } = {
      resort: 'bg-purple-100 text-purple-800',
      pousada: 'bg-green-100 text-green-800',
      hotel: 'bg-blue-100 text-blue-800',
      eco_resort: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type || ''] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {formData.accommodation ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏨</span>
                  <div>
                    <p className="font-medium text-green-800">
                      {formData.accommodation.name}
                    </p>
                    <p className="text-sm text-green-600">
                      📍 {formData.accommodation.location}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={`${getAccommodationTypeColor(formData.accommodation.type)} text-xs`}
                >
                  {getAccommodationTypeLabel(formData.accommodation.type)}
                </Badge>
              </div>
              <Button onClick={onNext} size="sm" className="bg-green-600 hover:bg-green-700">
                Próximo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-lg">
              Escolha onde você ficará hospedado durante sua viagem
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <RadioGroup 
                value={selectedAccommodationId} 
                onValueChange={handleAccommodationChange}
                className="space-y-4"
              >
                {accommodations.map(accommodation => (
                  <div key={accommodation.id} className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem 
                        value={accommodation.id} 
                        id={accommodation.id}
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={accommodation.id} 
                        className="cursor-pointer flex-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🏨</span>
                              <span className="font-medium text-base">
                                {accommodation.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">
                              📍 {accommodation.location}
                            </p>
                          </div>
                          <Badge 
                            className={`${getAccommodationTypeColor(accommodation.type)} text-xs`}
                          >
                            {getAccommodationTypeLabel(accommodation.type)}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {formData.accommodation && (
            <div className="text-center mt-6">
              <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
                Continuar para Pessoas
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}