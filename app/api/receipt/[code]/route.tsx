import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { renderToStream } from "@react-pdf/renderer";
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// --- PDF STYLES ---
const pdfStyles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#080808', color: '#F5F5F5' },
  header: { marginBottom: 30, textAlign: 'center' },
  title: { fontSize: 24, color: '#39FF14' },
  subtitle: { fontSize: 10, color: '#A0A0A0', marginTop: 5, letterSpacing: 2 },
  section: { marginVertical: 20, padding: 20, backgroundColor: '#161616', borderRadius: 10, border: '1pt solid #222' },
  code: { fontSize: 32, color: '#39FF14', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, fontSize: 10 },
  label: { color: '#A0A0A0' },
  value: { color: '#F5F5F5' },
  notice: { marginVertical: 20, padding: 10, borderLeft: '4pt solid #f59e0b', backgroundColor: '#f59e0b1a', fontSize: 9, color: '#f59e0b' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, borderTop: '1pt solid #222', paddingTop: 10, fontSize: 8, color: '#666', textAlign: 'center' }
});

// --- PDF COMPONENT ---
const ReceiptPDF = ({ r }: { r: any }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>WARRIORS ARENA</Text>
        <Text style={pdfStyles.subtitle}>OFFICIAL BOOKING RECEIPT</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.code}>{r.reservationCode}</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>GAME</Text>
          <Text style={pdfStyles.value}>{r.game}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>DATE & TIME</Text>
          <Text style={pdfStyles.value}>{String(r.sessionDate).split('T')[0]} @ {r.sessionTime}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>PLAYERS</Text>
          <Text style={pdfStyles.value}>{r.playerCount}</Text>
        </View>
      </View>

      <View style={pdfStyles.notice}>
        <Text>PAY ON ARRIVAL: This receipt confirms your slot. Please pay the total amount at the arena.</Text>
        <Text style={{ marginTop: 5 }}>PARK ENTRANCE: 30-50 EGP per person not included in reservation price.</Text>
      </View>

      <View style={styles.footer}>
        <Text>Warriors Arena · Heliopolis, Cairo · www.warriors-arena.com</Text>
        <Text>Please arrive 10 minutes prior to your session.</Text>
      </View>
    </Page>
  </Document>
);

// --- ROUTE HANDLER ---
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success } = await rateLimit(ip, `receipt:${params.code}`, 10, 60 * 60 * 1000);

  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const r = await db.reservation.findUnique({
      where: { reservationCode: params.code }
    });

    if (!r || r.status !== "CONFIRMED") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const stream = await renderToStream(<ReceiptPDF r={r} />);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="WarriorsArena_Receipt_${params.code}.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Fail:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

const styles = pdfStyles; 
