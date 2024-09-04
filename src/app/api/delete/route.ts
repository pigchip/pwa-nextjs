import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const { email, password } = await req.json();
  
  // Lógica para eliminar una cuenta de usuario.
  
  return NextResponse.json({ message: "User account deleted successfully" });
}
