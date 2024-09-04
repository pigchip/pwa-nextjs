import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, password } = await req.json();
  
  // Lógica para iniciar sesión de supervisor.
  
  return NextResponse.json({ message: "Supervisor signed in successfully", id });
}
