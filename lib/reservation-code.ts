import db from './db';

export async function generateReservationCode(): Promise<string> {
  const year = new Date().getFullYear();
  let code = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    code = `WA-${year}-${randomNum}`;
    
    const existing = await db.reservation.findUnique({
      where: { reservationCode: code }
    });
    
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) throw new Error('Could not generate unique reservation code');
  
  return code;
}
