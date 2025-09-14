"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { type FormData, type TripDates } from '@/types';

interface DateSelectorProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}

export function DateSelector({ formData, updateFormData, onNext }: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempArrival, setTempArrival] = useState<Date | undefined>();
  const [tempDeparture, setTempDeparture] = useState<Date | undefined>();

  const calculateDays = (arrival: Date, departure: Date): number => {
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleConfirmDates = () => {
    if (tempArrival && tempDeparture) {
      const days = calculateDays(tempArrival, tempDeparture);
      const tripDates: TripDates = {
        arrival: tempArrival,
        departure: tempDeparture,
        days
      };
      
      updateFormData({ dates: tripDates });
      setIsOpen(false);
      onNext();
    }
  };

  const handleDateSelect = (date: Date | undefined, type: 'arrival' | 'departure') => {
    if (!date) return;

    if (type === 'arrival') {
      setTempArrival(date);
      // If departure is before arrival, reset it
      if (tempDeparture && tempDeparture <= date) {
        setTempDeparture(undefined);
      }
    } else {
      // Only allow departure dates after arrival
      if (tempArrival && date > tempArrival) {
        setTempDeparture(date);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {formData.dates ? (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800">
                📅 Datas Selecionadas
              </p>
              <p className="text-green-700">
                Chegada: {formatDate(formData.dates.arrival)} | 
                Partida: {formatDate(formData.dates.departure)}
              </p>
              <Badge variant="secondary" className="mt-2">
                {formData.dates.days} dias de viagem
              </Badge>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Datas da Viagem</DialogTitle>
                </DialogHeader>
                <DateSelectionModal
                  tempArrival={tempArrival}
                  tempDeparture={tempDeparture}
                  onDateSelect={handleDateSelect}
                  onConfirm={handleConfirmDates}
                  onCancel={() => setIsOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setTempArrival(undefined);
                setTempDeparture(undefined);
              }}
            >
              📅 Selecionar Datas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Selecionar Datas da Viagem</DialogTitle>
            </DialogHeader>
            <DateSelectionModal
              tempArrival={tempArrival}
              tempDeparture={tempDeparture}
              onDateSelect={handleDateSelect}
              onConfirm={handleConfirmDates}
              onCancel={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface DateSelectionModalProps {
  tempArrival?: Date;
  tempDeparture?: Date;
  onDateSelect: (date: Date | undefined, type: 'arrival' | 'departure') => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function DateSelectionModal({ 
  tempArrival, 
  tempDeparture, 
  onDateSelect, 
  onConfirm, 
  onCancel 
}: DateSelectionModalProps) {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 1); // 1 year ahead

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Arrival Date */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="font-medium text-lg">📍 Data de Chegada</h3>
            {tempArrival && (
              <Badge variant="outline" className="mt-2">
                {tempArrival.toLocaleDateString('pt-BR')}
              </Badge>
            )}
          </div>
          <Calendar
            mode="single"
            selected={tempArrival}
            onSelect={(date) => onDateSelect(date, 'arrival')}
            disabled={(date) => date < today || date > maxDate}
            className="rounded-md border"
          />
        </div>

        {/* Departure Date */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="font-medium text-lg">🛫 Data de Partida</h3>
            {tempDeparture && (
              <Badge variant="outline" className="mt-2">
                {tempDeparture.toLocaleDateString('pt-BR')}
              </Badge>
            )}
          </div>
          <Calendar
            mode="single"
            selected={tempDeparture}
            onSelect={(date) => onDateSelect(date, 'departure')}
            disabled={(date) => {
              if (!tempArrival) return true;
              return date <= tempArrival || date > maxDate;
            }}
            className="rounded-md border"
          />
        </div>
      </div>

      {/* Summary */}
      {tempArrival && tempDeparture && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <p className="font-medium text-blue-800">
              Resumo da Viagem
            </p>
            <p className="text-blue-700">
              {tempArrival.toLocaleDateString('pt-BR')} até {tempDeparture.toLocaleDateString('pt-BR')}
            </p>
            <Badge className="mt-2 bg-blue-600">
              {Math.ceil((tempDeparture.getTime() - tempArrival.getTime()) / (1000 * 60 * 60 * 24))} dias
            </Badge>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={!tempArrival || !tempDeparture}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Confirmar Datas
        </Button>
      </div>
    </div>
  );
}