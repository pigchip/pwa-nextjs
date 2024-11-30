// lib/fetchSupervisors.ts
import { Supervisor } from '@/types/supervisor';

export async function fetchSupervisors(): Promise<Supervisor[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/supervisors`);
  if (!response.ok) {
    throw new Error('Failed to fetch supervisors');
  }
  const data: Supervisor[] = await response.json();
  return data;
}