"use client";

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { type FormData } from '@/types';

interface PeopleSelectorProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}

export function PeopleSelector({ formData, updateFormData, onNext }: PeopleSelectorProps) {
  const handleAdultsChange = (value: string) => {
    const adults = parseInt(value);
    updateFormData({ adults });
  };

  const handleChildrenChange = (value: string) => {
    const children = parseInt(value);
    const currentAges = formData.childrenAges.slice(0, children);
    // Fill missing ages with default value of 5
    while (currentAges.length < children) {
      currentAges.push(5);
    }
    updateFormData({ children, childrenAges: currentAges });
  };

  const handleChildAgeChange = (index: number, age: string) => {
    const newAges = [...formData.childrenAges];
    newAges[index] = parseInt(age);
    updateFormData({ childrenAges: newAges });
  };

  const handleSeniorsChange = (checked: boolean) => {
    updateFormData({ hasSeniors: checked });
  };

  const getTotalPeople = () => {
    return formData.adults + formData.children;
  };

  const getPricingInfo = () => {
    const adults = formData.adults;
    const seniors = formData.hasSeniors ? Math.min(2, adults) : 0;
    const regularAdults = adults - seniors;
    const children = formData.children;
    const infants = formData.childrenAges.filter(age => age < 2).length;
    const regularChildren = children - infants;

    return { regularAdults, seniors, regularChildren, infants };
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 text-lg">
          Defina quantas pessoas participarão da viagem para calcular os preços
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Adults */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <div>
                  <p className="font-medium">Adultos</p>
                  <p className="text-sm text-gray-500">A partir de 12 anos</p>
                </div>
              </div>
              <Select value={formData.adults.toString()} onValueChange={handleAdultsChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Adulto' : 'Adultos'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Children */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🧒</span>
                <div>
                  <p className="font-medium">Crianças</p>
                  <p className="text-sm text-gray-500">De 2 a 11 anos</p>
                </div>
              </div>
              <Select value={formData.children.toString()} onValueChange={handleChildrenChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num === 0 ? 'Nenhuma criança' : `${num} ${num === 1 ? 'Criança' : 'Crianças'}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Child Ages */}
      {formData.children > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎂</span>
                <p className="font-medium text-blue-800">Idades das Crianças</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: formData.children }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-sm font-medium text-blue-700">Criança {i + 1}</p>
                    <Select 
                      value={formData.childrenAges[i]?.toString() || "5"} 
                      onValueChange={(age) => handleChildAgeChange(i, age)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Idade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, age) => age + 1).map(age => (
                          <SelectItem key={age} value={age.toString()}>
                            {age} {age === 1 ? 'ano' : 'anos'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seniors */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="seniors"
              checked={formData.hasSeniors}
              onCheckedChange={handleSeniorsChange}
            />
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👴👵</span>
              <div>
                <label htmlFor="seniors" className="font-medium cursor-pointer">
                  Melhor Idade (+60 anos)
                </label>
                <p className="text-sm text-gray-500">
                  Alguns passeios oferecem desconto para a melhor idade
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {getTotalPeople() > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">👥</span>
                <p className="font-medium text-green-800">Resumo do Grupo</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.adults > 0 && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {formData.adults} {formData.adults === 1 ? 'Adulto' : 'Adultos'}
                  </Badge>
                )}
                {formData.hasSeniors && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Melhor Idade
                  </Badge>
                )}
                {formData.children > 0 && (
                  <Badge className="bg-orange-100 text-orange-800">
                    {formData.children} {formData.children === 1 ? 'Criança' : 'Crianças'}
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="text-sm text-green-700">
                <p><strong>Total de pessoas:</strong> {getTotalPeople()}</p>
                {formData.children > 0 && formData.childrenAges.length > 0 && (
                  <p><strong>Idades:</strong> {formData.childrenAges.join(', ')} anos</p>
                )}
              </div>

              {/* Pricing Categories Preview */}
              <div className="bg-white p-3 rounded border">
                <p className="text-xs font-medium text-gray-600 mb-2">Categorias de Preço:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(() => {
                    const pricing = getPricingInfo();
                    return (
                      <>
                        {pricing.regularAdults > 0 && (
                          <div>ADU: {pricing.regularAdults} pessoa{pricing.regularAdults > 1 ? 's' : ''}</div>
                        )}
                        {pricing.seniors > 0 && (
                          <div>+60: {pricing.seniors} pessoa{pricing.seniors > 1 ? 's' : ''}</div>
                        )}
                        {pricing.regularChildren > 0 && (
                          <div>CHD: {pricing.regularChildren} criança{pricing.regularChildren > 1 ? 's' : ''}</div>
                        )}
                        {pricing.infants > 0 && (
                          <div>INF: {pricing.infants} bebê{pricing.infants > 1 ? 's' : ''} (grátis)</div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {formData.adults > 0 && (
        <div className="text-center">
          <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Continuar para Atividades
          </Button>
        </div>
      )}
    </div>
  );
}