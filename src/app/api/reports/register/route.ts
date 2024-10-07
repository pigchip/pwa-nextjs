import { Register } from '@/types/register';
import { NextRequest, NextResponse } from 'next/server';

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: NextRequest) {
  const { user, transport, line, route, station, date, time, body, status, x, y }: Register = await req.json();

  try {
    // Fetch the information from the external API
    const response = await fetch(`${apiUrl}/api/reports/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, transport, line, route, station, date, time, body, status, x, y }),
    });

    if (!response.ok) {
      throw new FetchError(response.status, 'Failed to fetch data from external API');
    }

    const data = await response.json();

    return NextResponse.json({
      message: 'Data received successfully',
      data,
    }, { status: 200 });
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

class FetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}