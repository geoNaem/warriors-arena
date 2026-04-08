import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success } = await rateLimit(ip, `view:${params.code}`, 10, 60 * 1000);

  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const reservation = await db.reservation.findUnique({
      where: { reservationCode: params.code },
      select: {
        reservationCode: true,
        game: true,
        duration: true,
        sessionDate: true,
        sessionTime: true,
        playerCount: true,
        clientName: true,
        status: true
      }
    });

    if (!reservation) {
      // Security: Don't reveal existence
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Fetch reservation error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
