import { Register } from '@/types/register';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const userIdMatch = pathname.match(/\/api\/user\/(\d+)\/reports/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId || isNaN(Number(userId))) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      message: 'User ID is required and must be a number',
      path: req.url,
    }, { status: 400 });
  }

  try {
    const reports: Register[] = await getReportsFromUser(Number(userId));
    return NextResponse.json(reports, { status: 200 });
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

async function getReportsFromUser(userId: number): Promise<Register[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error('API base URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/user/${userId}/reports`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new FetchError(response.status, errorData.message || 'Failed to fetch reports');
  }

  const data: Register[] = await response.json();

  return data;
}

class FetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}