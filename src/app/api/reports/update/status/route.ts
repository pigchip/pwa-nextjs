import { Register, Status } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(req: NextRequest) {
  try {
    const { id, status }: { id: number; status: Status } = await req.json();

    // Validate status
    if (!Object.values(Status).includes(status)) {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Invalid status value',
        path: req.url,
      }, { status: 400 });
    }

    // Fetch the register by id
    const response = await fetch(`${apiUrl}/api/reports/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new FetchError(response.status, 'Failed to fetch register');
    }

    const register: Register = await response.json();

    // Update the status
    register.status = status;

    // Save the updated register
    const updateResponse = await fetch(`${apiUrl}/api/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(register),
    });

    if (!updateResponse.ok) {
      throw new FetchError(updateResponse.status, 'Failed to update register');
    }

    const updatedRegister = await updateResponse.json();

    return NextResponse.json({
      message: 'Register updated successfully',
      data: updatedRegister,
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