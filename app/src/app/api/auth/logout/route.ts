import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth/session";

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
