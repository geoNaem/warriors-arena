import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendOwnerWhatsApp(reservation: any) {
  try {
    const message = `Warriors Arena — New Booking
Game: ${reservation.game}
Date: ${reservation.sessionDate} at ${reservation.sessionTime}
Duration: ${reservation.duration} min
Players: ${reservation.playerCount}
Client: ${reservation.clientName} — ${reservation.clientPhone}
Code: ${reservation.reservationCode}`;

    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${process.env.OWNER_WHATSAPP}`
    });
    
    console.log(`[WHATSAPP] Sent for ${reservation.reservationCode}`);
  } catch (error) {
    // Non-critical fallback: only log, don't throw
    console.error("Twilio WhatsApp Error:", error);
  }
}
