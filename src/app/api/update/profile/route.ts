import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const data = await req.json();
  
  // Lógica para actualizar información del usuario.
  
  return NextResponse.json({ message: "User profile updated successfully", data });
}
