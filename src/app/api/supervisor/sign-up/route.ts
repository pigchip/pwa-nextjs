import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, sup, admin, line, station } = await req.json();

    console.log(email, sup, admin, line, station);

    if (!email || !sup || !admin || line === undefined || station === undefined) {
      return NextResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: "Bad Request",
          message: "All fields are required",
          path: req.url,
        },
        { status: 400 }
      );
    }

    // Fetch user by email
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const userResponse = await fetch(`${apiUrl}/api/userByEmail/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      return NextResponse.json(errorData, { status: userResponse.status });
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    if (!userId) {
      return NextResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: "User not found",
          path: req.url,
        },
        { status: 404 }
      );
    }

    // Create supervisor
    const supervisorData = {
      sup,
      user: userId,
      admin,
      line,
      station,
    };

    const supervisorResponse = await fetch(`${apiUrl}/api/supervisor/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supervisorData),
    });

    if (!supervisorResponse.ok) {
      const errorText = await supervisorResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      return NextResponse.json(errorData, { status: supervisorResponse.status });
    }

    const createdSupervisorText = await supervisorResponse.text();
    let createdSupervisor;
    try {
      createdSupervisor = JSON.parse(createdSupervisorText);
    } catch (e) {
      createdSupervisor = { message: createdSupervisorText };
    }

    return NextResponse.json(
      {
        message: "Supervisor account created successfully",
        data: createdSupervisor,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        path: req.url,
      },
      { status: 500 }
    );
  }
}