import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, password } = await req.json();

  // Verificar si id y password fueron proporcionados
  if (!id || !password) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Solicitud incorrecta",
        message: "El id y la contraseña son obligatorios.",
        path: "/api/supervisor/sign-in",
      },
      { status: 400 }
    );
  }

  try {
    // Obtener la URL base de la API desde la variable de entorno
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Hacer una petición POST a la API externa
    const response = await fetch(`${apiUrl}/api/supervisor/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, password }),
    });

    // Si la API externa devuelve una respuesta con código de error
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    // Obtener los datos de la respuesta de la API
    const data = await response.json();

    // Devolver los datos tal cual fueron recibidos de la API
    return NextResponse.json(data);

  } catch (error) {
    // Si hubo un error de red o no hay conexión a internet
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Error de red",
        message: "No se pudo conectar con la API externa. Por favor, revisa tu conexión a internet.",
        path: "/api/sign-in",
      },
      { status: 500 }
    );
  }
}
