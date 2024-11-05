 // pages/api/supervisors/delete.ts

import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  try {
    const { id, password } = await req.json();

    if (!id || !password) {
      return NextResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: 'ID and password are required',
          path: req.url,
        },
        { status: 400 }
      );
    }

    // Logic to delete a supervisor account
    // This is a placeholder and should be replaced with actual database deletion logic
    const deletedSupervisor = {
      id,
      message: 'Supervisor account deleted successfully',
    };

    // Assuming the deletion was successful
    return NextResponse.json(deletedSupervisor, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        path: req.url,
      },
      { status: 500 }
    );
  }
}