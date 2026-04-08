import { GameType } from '@prisma/client'
import db from './db'

export function generateSlots(game: GameType, duration: number): string[] {
  // Operating hours: 18:00 to 21:00 (Last slot must finish by 21:00)
  const allSlots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
  
  if (game === GameType.LASER_TAG) {
    if (duration === 60) {
      return ["18:00", "19:00", "20:00"];
    }
    return ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
  }
  
  if (game === GameType.GEL_BLASTERS) {
    // Only 30 min sessions for Gel Blasters
    return ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
  }
  
  return [];
}

export async function getAvailableSlots(game: GameType, date: Date, duration: number) {
  const possibleSlots = generateSlots(game, duration);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch all confirmed reservations for the day and game
  const reservations = await db.reservation.findMany({
    where: {
      game,
      sessionDate: { gte: startOfDay, lte: endOfDay },
      status: { in: ['CONFIRMED', 'COMPLETED'] }
    },
    select: { sessionTime: true, playerCount: true, duration: true }
  });

  // Fetch all active slot locks
  const locks = await db.slotLock.findMany({
    where: {
      game,
      sessionDate: { gte: startOfDay, lte: endOfDay },
      lockedUntil: { gt: new Date() }
    }
  });

  const slots = possibleSlots.map(time => {
    // Calculate total capacity used in this slot
    // For 60 min sessions, we need to check both the starting slot and the overlapping half-hour slot if applicable
    const resCount = reservations
      .filter(r => {
        if (r.sessionTime === time) return true;
        // If it's a 60 min reservation starting 30 mins before current slot
        if (r.duration === 60) {
          const startTime = parseInt(r.sessionTime.replace(':', ''));
          const currentTime = parseInt(time.replace(':', ''));
          return currentTime === startTime + 30 || (startTime === 2030 && currentTime === 2100); // Edge cases handled by operating hours
        }
        return false;
      })
      .reduce((acc, r) => acc + r.playerCount, 0);

    const lockCount = locks
      .filter(l => l.sessionTime === time)
      .length; // Each lock represents a potential session

    const totalUsed = resCount + (lockCount * 6); // Assuming lock reserves full slot for 6 players or just 1? 
    // Business rule: "Max 6 players per session". 
    // Usually locks are per person or per group. For simplicity here, we count confirmed players.
    
    return {
      time,
      remainingCapacity: 6 - resCount,
      isAvailable: (6 - resCount) > 0
    };
  });

  return slots;
}
