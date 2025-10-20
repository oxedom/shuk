import type { Session } from "next-auth";

import { NextResponse } from "next/server";
import { userService } from "app/backend/services";

async function isUserFullySignedUp(session: Session | null): Promise<boolean> {
  const email = session?.user?.email;
  if (!email) return false;

  try {
    const user = await userService.findByEmail(email);
    return !!user; // Return true if user exists, false otherwise
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return false; // Return false on error instead of throwing
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const email = searchParams.get("email");

  // Validate secret first
  if (!process.env.SECRET || process.env.SECRET !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  // Validate email format
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 },
    );
  }

  try {
    //
    const user = await userService.findByEmail(email);
    if (!user) {
      return NextResponse.json({ user: null });
    }
    user.phone = "";
    user.birthday = null;

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { secret, session } = await req.json();

  if (process.env.SECRET !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const status = await isUserFullySignedUp(session);

  return NextResponse.json({ status });
}
