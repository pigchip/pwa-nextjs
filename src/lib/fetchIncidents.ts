// lib/fetchIncidents.ts
import { Station } from '@/types/station';

export async function fetchIncidents(): Promise<Station[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stations/incidents`);
  if (!response.ok) {
    throw new Error('Failed to fetch station incidents');
  }
  const data: Station[] = await response.json();
  return data;
}