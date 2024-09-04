import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  
  // Lógica para crear una cuenta de usuario.
  
  return NextResponse.json({ message: "User account created successfully", data });
}
