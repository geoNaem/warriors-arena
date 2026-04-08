import { NextRequest, NextResponse } from "next/server";
import { GameType } from "@prisma/client";
import { getAvailableSlots } from "@/lib/slot-engine";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success } = await rateLimit(ip, "slots", 60, 60 * 1000);

  if (!success) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests" },
      { status: 429 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const game = searchParams.get("game") as GameType;
  const dateStr = searchParams.get("date");
  const duration = parseInt(searchParams.get("duration") || "30");

  if (!Object.values(GameType).includes(game)) {
    return NextResponse.json({ error: "validation_error", message: "Invalid game type" }, { status: 400 });
  }

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "validation_error", message: "Invalid date format" }, { status: 400 });
  }

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);

  if (date < today || date > maxDate) {
    return NextResponse.json({ error: "validation_error", message: "Date must be within 30 days" }, { status: 400 });
  }

  if (duration !== 30 && duration !== 60) {
    return NextResponse.json({ error: "validation_error", message: "Invalid duration" }, { status: 400 });
  }

  if (game === GameType.GEL_BLASTERS && duration === 60) {
    return NextResponse.json({ error: "validation_error", message: "Gel Blasters only supports 30 min" }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(game, date, duration);
    
    return NextResponse.json(slots, {
      headers: {
        "Cache-Control": "public, max-age=10, stale-while-revalidate=59"
      }
    });
  } catch (error) {
    console.error("Slot fetch error:", error);
    return NextResponse.json({ error: "internal_error", message: "Failed to fetch slots" }, { status: 500 });
  }
}
