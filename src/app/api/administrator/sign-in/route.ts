import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, password } = await req.json();
  
  // Lógica para iniciar sesión de administrador.
  
  return NextResponse.json({ message: "Administrator signed in successfully", id });
}
