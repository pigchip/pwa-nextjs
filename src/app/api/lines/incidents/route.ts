// pages/api/lines/incidents.ts

import { Line } from '@/types/line';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const incidents: Line[] = await getLineIncidents();
    return NextResponse.json(incidents, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof FetchError) {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        status: error.status,
        error: error.message,
        path: req.url,
      }, { status: error.status });
    }
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      path: req.url,
    }, { status: 500 });
  }
}

async function getLineIncidents(): Promise<Line[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error('API base URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/lines/incidents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log(errorData);
    throw new FetchError(response.status, errorData.message || 'Failed to fetch line incidents');
  }

  const data: Line[] = await response.json();

  return data; // Return the raw data array
}

class FetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}