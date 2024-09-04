import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const { id, password } = await req.json();
  
  // Lógica para eliminar una cuenta de supervisor.
  
  return NextResponse.json({ message: "Supervisor account deleted successfully" });
}
