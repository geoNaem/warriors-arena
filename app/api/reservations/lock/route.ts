import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LockSchema } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success } = await rateLimit(ip, "lock", 5, 10 * 60 * 1000);

  if (!success) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many lock attempts" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const result = LockSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "validation_error", message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { game, date, time, duration, playerCount, sessionId } = result.data;
    const sessionDate = new Date(date);

    // Atomically check availability and create lock
    const lock = await db.$transaction(async (tx: any) => {
      // 1. Calculate current confirmed players
      const reservations = await tx.reservation.findMany({
        where: {
          game,
          sessionDate,
          sessionTime: time,
          status: { in: ["CONFIRMED", "COMPLETED"] }
        }
      });

      const usedCapacity = reservations.reduce((acc, r) => acc + r.playerCount, 0);

      // 2. Calculate active locks
      const activeLocks = await tx.slotLock.count({
        where: {
          game,
          sessionDate,
          sessionTime: time,
          lockedUntil: { gt: new Date() }
        }
      });

      // Assuming each lock is for one potential session? 
      // Rule says: "Slot is FULL when CONFIRMED reservations + active SlotLocks >= 6"
      // Wait, if activeLocks is count of lock records, and each lock can have different playerCount...
      // But SlotLock model doesn't have playerCount! 
      // User prompt says: "Slot is FULL when CONFIRMED reservations + active SlotLocks >= 6"
      // This suggests each lock counts as 1 toward the 6 limit. 

      if (usedCapacity + activeLocks + playerCount > 6) {
        throw new Error("slot_full");
      }

      return await tx.slotLock.create({
        data: {
          game,
          sessionDate,
          sessionTime: time,
          duration,
          playerCount,
          lockedUntil: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          sessionId
        }
      });
    });

    return NextResponse.json({ 
      lockId: lock.id, 
      expiresAt: lock.lockedUntil 
    });

  } catch (error: any) {
    if (error.message === "slot_full") {
      return NextResponse.json({ error: "slot_full", message: "This slot just filled up" }, { status: 409 });
    }
    console.error("Lock error:", error);
    return NextResponse.json({ error: "internal_error", message: "Failed to lock slot" }, { status: 500 });
  }
}
