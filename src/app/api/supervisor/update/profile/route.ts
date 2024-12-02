// pages/api/supervisor/update/profile.ts

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate the incoming data
    const { sup, user, admin, line, station } = data;

    if (!sup || !user || !admin || !line || !station) {
      return NextResponse.json({ 
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'All fields are required',
        path: req.url,
      }, { status: 400 });
    }

    // Logic to update supervisor profile in the database
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiUrl) {
      throw new Error('API base URL is not defined');
    }

    const response = await fetch(`${apiUrl}/api/supervisor/update/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sup: String(sup),
        user: Number(user),
        admin: String(admin),
        line: String(line),
        station: Number(station)
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData);
      throw new FetchError(response.status, errorData.message || 'Failed to update supervisor');
    }

    const updatedSupervisor = await response.json();

    console.log(updatedSupervisor);

    return NextResponse.json({ 
      message: 'Supervisor profile updated successfully', 
      data: updatedSupervisor 
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