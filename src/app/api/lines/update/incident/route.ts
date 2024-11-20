// pages/api/lines/update/incident.ts

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const { id, incident, speed } = await req.json();

    if (typeof id !== 'number' || typeof incident !== 'string' || typeof speed !== 'number') {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Invalid request body',
        path: req.url,
      }, { status: 400 });
    }

    const updatedLine = await updateIncident(id, incident, speed);
    return NextResponse.json(updatedLine, { status: 200 });
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

async function updateIncident(id: number, incident: string, speed: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error('API base URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/lines/update/incident`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, incident, speed }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log(errorData);
    throw new FetchError(response.status, errorData.message || 'Failed to update incident');
  }

  const data = await response.json();

  return data; // Return the updated line data
}

class FetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}