import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  
  // Lógica para crear una cuenta de supervisor.
  
  return NextResponse.json({ message: "Supervisor account created successfully", data });
}
