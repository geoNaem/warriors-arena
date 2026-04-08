import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendClientConfirmation(reservation: { clientEmail: string, game: string, reservationCode: string, sessionDate: any, sessionTime: string, playerCount: number }) {
  const isLaserTag = reservation.game === 'LASER_TAG' || reservation.game === 'laser-tag';
  const gameNameEN = isLaserTag ? "Laser Tag" : "Gel Blasters";
  const gameNameAR = isLaserTag ? "ليزر تاج" : "جل بلاسترز";

  try {
    const { data, error } = await resend.emails.send({
      from: 'Warriors Arena <bookings@warriors-arena.com>',
      to: [reservation.clientEmail],
      subject: `Your Warriors Arena Booking is Confirmed! — ${reservation.reservationCode}`,
      html: `
        <div style="background-color: #080808; color: #F5F5F5; font-family: sans-serif; padding: 40px; border-radius: 20px;">
          <h1 style="color: #39FF14; font-size: 24px;">WARRIORS ARENA</h1>
          <p style="font-size: 16px; color: #A0A0A0;">Your mission is confirmed. Prepare for combat.</p>
          
          <div style="background-color: #161616; padding: 20px; border: 1px solid #39FF1433; border-radius: 12px; margin: 30px 0;">
             <div style="font-family: monospace; font-size: 32px; color: #39FF14; margin-bottom: 20px;">${reservation.reservationCode}</div>
             <table style="width: 100%; color: #F5F5F5; border-collapse: collapse;">
                <tr><td style="color: #A0A0A0; padding: 5px 0;">Game:</td><td>${gameNameEN} / ${gameNameAR}</td></tr>
                <tr><td style="color: #A0A0A0; padding: 5px 0;">Date:</td><td>${reservation.sessionDate}</td></tr>
                <tr><td style="color: #A0A0A0; padding: 5px 0;">Time:</td><td>${reservation.sessionTime}</td></tr>
                <tr><td style="color: #A0A0A0; padding: 5px 0;">Unit Size:</td><td>${reservation.playerCount} Players</td></tr>
             </table>
          </div>

          <div style="background-color: #f59e0b1a; border-left: 4px solid #f59e0b; padding: 15px; color: #f59e0b; font-size: 14px; margin-bottom: 30px;">
            ⚠ Reservation fees do not include park entrance tickets. 30 EGP (normal days) / 50 EGP (holidays).
          </div>

          <p style="font-size: 14px;">Please arrive 10 minutes before your session. Bring your confirmation code.</p>
          
          <div style="margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/receipt/${reservation.reservationCode}" style="background-color: #39FF14; color: black; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: bold; display: inline-block;">DOWNLOAD RECEIPT</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #333;" />
          <p style="font-size: 12px; color: #666;">
            Heliopolis, Cairo · Open daily 6PM–9PM<br/>
            Cancellations accepted up to 6 hours before session.
          </p>
        </div>
      `,
    });
    return { data, error };
  } catch (error) {
    console.error("Email error:", error);
    return { error };
  }
}

export async function sendOwnerNotification(reservation: Reservation) {
  try {
    await resend.emails.send({
      from: 'System <status@warriors-arena.com>',
      to: [process.env.OWNER_EMAIL || ""],
      subject: `New Booking: ${reservation.game} ${reservation.sessionDate} ${reservation.sessionTime}`,
      html: `
        <h2>New Reservation: ${reservation.reservationCode}</h2>
        <p><strong>Game:</strong> ${reservation.game}</p>
        <p><strong>Client:</strong> ${reservation.clientName}</p>
        <p><strong>Phone:</strong> ${reservation.clientPhone}</p>
        <p><strong>Capacity:</strong> ${reservation.playerCount} players</p>
        <p><strong>Time:</strong> ${reservation.sessionDate} at ${reservation.sessionTime}</p>
      `
    });
  } catch (error) {
    console.error("Owner Email Fail:", error);
  }
}
