import { Register } from '@/types/register';
import { NextRequest, NextResponse } from 'next/server';

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const reportIdMatch = pathname.match(/\/api\/reports\/(\d+)/);
    const reportId = reportIdMatch ? reportIdMatch[1] : null;

    if (!reportId || isNaN(Number(reportId))) {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Report ID is required and must be a number',
        path: req.url,
      }, { status: 400 });
    }

    const report: Register = await getReport(Number(reportId));
    return NextResponse.json(report, { status: 200 });
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

async function getReport(reportId: number): Promise<Register> {
  if (!apiUrl) {
    throw new Error('API base URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/reports/${reportId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new FetchError(response.status, errorData.message || 'Failed to fetch report');
  }

  const data: Register = await response.json();
  return data;
}

class FetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}