import { z } from "zod";
import { GameType } from "@prisma/client";

export const LockSchema = z.object({
  game: z.nativeEnum(GameType),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  duration: z.union([z.literal(30), z.literal(60)]),
  playerCount: z.number().int().min(1).max(6),
  sessionId: z.string().alphanumeric().max(64)
}).refine(data => {
  if (data.game === GameType.GEL_BLASTERS && data.duration === 60) {
    return false;
  }
  return true;
}, {
  message: "60 minute sessions are only available for Laser Tag",
  path: ["duration"]
});

export const ReservationSchema = z.object({
  lockId: z.string().cuid(),
  clientName: z.string().min(2).max(100).transform(val => val.replace(/<[^>]*>?/gm, '')),
  clientPhone: z.string().regex(/^(?:\+20|0)?1[0125]\d{8}$/, "Invalid Egyptian phone number"),
  clientEmail: z.string().email().toLowerCase().max(254),
  policyAccepted: z.literal(true),
  sessionId: z.string().alphanumeric().max(64),
  captchaToken: z.string().min(1)
});

export const CancelSchema = z.object({
  token: z.string().cuid()
});
