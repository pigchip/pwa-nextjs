import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;

  if (!email) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Solicitud incorrecta",
        message: "El correo electrónico es obligatorio.",
        path: "/api/userByEmail",
      },
      { status: 400 }
    );
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const response = await fetch(`${apiUrl}/api/userByEmail/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Error de red",
        message: "No se pudo conectar con la API externa.",
        path: `/api/userByEmail/${email}`,
      },
      { status: 500 }
    );
  }
}
