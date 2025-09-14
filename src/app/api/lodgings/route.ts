import { NextResponse } from 'next/server';
import { Accommodation } from '@/types';

// Mock data - in production this would fetch from Google Drive
const mockLodgings: { accommodations: Accommodation[] } = {
  accommodations: [
    {
      id: "porto_seguro_praia",
      name: "Porto Seguro Praia Resort",
      location: "Porto Seguro",
      type: "resort"
    },
    {
      id: "trancoso_resort", 
      name: "Trancoso Resort",
      location: "Trancoso",
      type: "resort"
    },
    {
      id: "arraial_pousada",
      name: "Pousada Arraial d'Ajuda",
      location: "Arraial d'Ajuda",
      type: "pousada"
    },
    {
      id: "caraiva_eco",
      name: "Caraíva Eco Resort", 
      location: "Caraíva",
      type: "eco_resort"
    },
    {
      id: "coroa_vermelha",
      name: "Hotel Coroa Vermelha",
      location: "Santa Cruz Cabrália", 
      type: "hotel"
    },
    {
      id: "centro_historico",
      name: "Pousada Centro Histórico",
      location: "Porto Seguro - Centro",
      type: "pousada"
    }
  ]
};

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(mockLodgings);
  } catch (error) {
    console.error('Error fetching lodgings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accommodations' },
      { status: 500 }
    );
  }
}