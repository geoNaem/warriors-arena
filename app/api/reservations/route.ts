import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReservationSchema } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCaptcha } from "@/lib/captcha";
import { encryptField } from "@/lib/crypto";
import { generateReservationCode } from "@/lib/reservation-code";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success: limitOk } = await rateLimit(ip, "reserve", 3, 60 * 60 * 1000);

  if (!limitOk) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many reservation attempts. Try again in an hour." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const result = ReservationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "validation_error", message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { lockId, clientName, clientPhone, clientEmail, sessionId, captchaToken } = result.data;

    // 1. Verify Captcha
    const captchaOk = await verifyCaptcha(captchaToken);
    if (!captchaOk) {
      return NextResponse.json({ error: "captcha_failed", message: "Captcha verification failed" }, { status: 400 });
    }

    // 2. Atomic Reservation Creation
    const reservation = await db.$transaction(async (tx: any) => {
      // Find and validate lock
      const lock = await tx.slotLock.findFirst({
        where: {
          id: lockId,
          sessionId,
          lockedUntil: { gt: new Date() }
        }
      });

      if (!lock) {
        throw new Error("lock_expired");
      }

      // FINAL CAPACITY CHECK (Anti-Double-Booking)
      const confirmedReservations = await tx.reservation.findMany({
        where: {
          game: lock.game,
          sessionDate: lock.sessionDate,
          sessionTime: lock.sessionTime,
          status: { in: ["CONFIRMED", "COMPLETED"] }
        }
      });

      const currentOccupancy = confirmedReservations.reduce((acc, r) => acc + r.playerCount, 0);
      if (currentOccupancy + lock.playerCount > 6) {
        throw new Error("slot_full");
      }

      // Generate unique code
      const reservationCode = await generateReservationCode();

      // Encrypt PII
      const encryptedPhone = encryptField(clientPhone);
      const encryptedEmail = encryptField(clientEmail);

      // Create Reservation
      const res = await tx.reservation.create({
        data: {
          reservationCode,
          game: lock.game,
          duration: lock.duration,
          sessionDate: lock.sessionDate,
          sessionTime: lock.sessionTime,
          playerCount: lock.playerCount,
          clientName,
          clientPhone: encryptedPhone,
          clientEmail: encryptedEmail,
          policyAccepted: true,
          ipAddress: ip,
          status: "CONFIRMED"
        }
      });

      // Delete the lock
      await tx.slotLock.delete({ where: { id: lockId } });

      return res;
    });

    // 3. Log (No PII)
    console.log(`[RESERVATION] Created: ${reservation.reservationCode} | IP: ${ip} | UTC: ${new Date().toISOString()}`);

    return NextResponse.json({
      reservationId: reservation.id,
      reservationCode: reservation.reservationCode,
      cancelToken: reservation.cancelToken
    }, { status: 201 });

  } catch (error: any) {
    if (error.message === "lock_expired") {
      return NextResponse.json({ error: "lock_expired", message: "Your session expired. Please start over." }, { status: 410 });
    }
    console.error("Reservation Error:", error);
    return NextResponse.json({ error: "internal_error", message: "Failed to create reservation" }, { status: 500 });
  }
}
