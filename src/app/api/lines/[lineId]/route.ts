// pages/api/lines/[lineId]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { lineId: string } }) {
  const { lineId } = params;

  try {
    const line = await getLineById(lineId);
    return NextResponse.json(line, { status: 200 });
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

async function getLineById(lineId: string): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error('API base URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/lines/${lineId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log(errorData);
    throw new FetchError(response.status, errorData.message || 'Failed to fetch line');
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