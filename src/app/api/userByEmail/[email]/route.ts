import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { email } = req.params;
  
  // Lógica para obtener información del usuario por email.
  
  return NextResponse.json({ message: "User info retrieved successfully", email });
}
