import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { name, lastname_pat, lastname_mat, email, ocuparion, password, phone} = await req.json();

  // Verificar si los campos obligatorios fueron proporcionados
  if (!name || !lastname_pat || !lastname_mat || !email || !ocuparion || !password || !phone) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Solicitud incorrecta",
        message: "Todos los campos son obligatorios.",
        path: "/api/update/profile",
      },
      { status: 400 }
    );
  }

  const id = 0;
  const curp = "";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Hacer una petición PUT a la API externa
    const response = await fetch(`${apiUrl}/api/update/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, lastname_pat, lastname_mat, email, curp, ocuparion, password, phone }),
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
        path: "/api/update/profile",
      },
      { status: 500 }
    );
  }
}