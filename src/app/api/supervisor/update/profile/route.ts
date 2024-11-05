// pages/api/supervisor/update/profile.ts

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate the incoming data
    const { id, name, lastname_pat, lastname_mat, email, curp, occupation, password, phone } = data;
    if (!id || !name || !lastname_pat || !lastname_mat || !email || !curp || !occupation || !password || !phone) {
      return NextResponse.json({ 
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'All fields are required',
        path: req.url,
      }, { status: 400 });
    }

    // Logic to update supervisor profile in the database
    // This is a placeholder and should be replaced with actual database update logic
    const updatedSupervisor = {
      id,
      name,
      lastname_pat,
      lastname_mat,
      email,
      curp,
      occupation,
      password,
      phone,
    };

    // Assuming the update was successful
    return NextResponse.json({ 
      message: 'Supervisor profile updated successfully', 
      data: updatedSupervisor 
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      timestamp: new Date().toISOString(),
      status: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      path: req.url,
    }, { status: 500 });
  }
}