import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "User ID is required",
      },
      { status: 400 }
    );
  }

  try {
    const user = await getUserById(Number(userId));
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof FetchError) {
      return NextResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: error.status,
          error: error.message,
          path: req.url,
        },
        { status: error.status }
      );
    }
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

async function getUserById(userId: Number): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    throw new Error("API base URL is not defined");
  }

  const response = await fetch(`${apiUrl}/api/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(response);

  if (!response.ok) {
    const errorData = await response.json();
    console.log(errorData);
    throw new FetchError(
      response.status,
      errorData.message || "Failed to fetch user"
    );
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