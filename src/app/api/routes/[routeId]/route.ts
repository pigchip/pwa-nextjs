// pages/api/routes/[routeId]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ routeId: Number }> }) {
  const { routeId } = await params;

  try {
    const route = await getRouteById(routeId);
    return NextResponse.json(route, { status: 200 });
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

async function getRouteById(routeId: Number): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error('API base URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/routes/${routeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log(errorData);
    throw new FetchError(response.status, errorData.message || 'Failed to fetch route');
  }

  const data = await response.json();

  return data; // Return the raw data
}

class FetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}