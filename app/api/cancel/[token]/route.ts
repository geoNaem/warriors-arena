import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success } = await rateLimit(ip, "cancel", 5, 60 * 60 * 1000);

  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const reservation = await db.reservation.findUnique({
      where: { cancelToken: params.token }
    });

    if (!reservation || reservation.cancelTokenUsed) {
      // Security: Return 200 to prevent token enumeration
      return NextResponse.json({ success: true, message: "Cancellation processed" });
    }

    // Business Rule: > 6 hours before sessionDate + Time
    const sessionTimeStr = reservation.sessionTime; // "18:00"
    const sessionDateTime = new Date(reservation.sessionDate);
    const [hours, minutes] = sessionTimeStr.split(":").map(Number);
    sessionDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const hoursDifference = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 6) {
      return NextResponse.json({ 
        error: "cancellation_window_passed", 
        message: "Cancellations must be made at least 6 hours in advance." 
      }, { status: 400 });
    }

    // Atomic Cancel
    await db.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "CANCELLED",
        cancelTokenUsed: true
      }
    });

    // TODO: Send cancellation confirmation email via Resend
    console.log(`[CANCELLATION] Success: ${reservation.reservationCode} | Time: ${now.toISOString()}`);

    return NextResponse.json({ success: true, message: "Reservation cancelled successfully" });

  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
