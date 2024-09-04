import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const data = await req.json();
  
  // Lógica para actualizar información del supervisor.
  
  return NextResponse.json({ message: "Supervisor profile updated successfully", data });
}
