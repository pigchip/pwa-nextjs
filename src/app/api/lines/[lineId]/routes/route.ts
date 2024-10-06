import { Route } from '@/types/route';
import { Station } from '@/types/station';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const lineIdMatch = pathname.match(/\/api\/lines\/(\d+)\/(stations|routes)/);
  const lineId = lineIdMatch ? lineIdMatch[1] : null;
  const resource = lineIdMatch ? lineIdMatch[2] : null;

  if (!lineId || isNaN(Number(lineId))) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      message: 'Line ID is required and must be a number',
      path: req.url,
    }, { status: 400 });
  }

  try {
    if (resource === 'stations') {
      const stations: Station[] = await getStationsForLine(Number(lineId));
      return NextResponse.json(stations, { status: 200 });
    } else if (resource === 'routes') {
      const routes: Route[] = await getRoutesForLine(Number(lineId));
      return NextResponse.json(routes, { status: 200 });
    } else {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Invalid resource',
        path: req.url,
      }, { status: 400 });
    }
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

async function getStationsForLine(line: number): Promise<Station[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error('API base URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/lines/${line}/stations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new FetchError(response.status, errorData.message || 'Failed to fetch stations');
  }

  const data: Station[] = await response.json();

  return data;
}

async function getRoutesForLine(line: number): Promise<Route[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error('API base URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/lines/${line}/routes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new FetchError(response.status, errorData.message || 'Failed to fetch routes');
  }

  const data: Route[] = await response.json();

  return data;
}

class FetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}