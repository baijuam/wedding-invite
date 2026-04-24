import { google } from "googleapis";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const mapsUrl =
  "https://www.google.com/maps/place/Sivagiri+Mutt/@8.7388845,76.7298358,17z/data=!3m1!4b1!4m6!3m5!1s0x3b05ef2ca32d60d5:0x64ef9b2fa4d6a0fc!8m2!3d8.7388792!4d76.7324107!16zL20vMGRfNWd5";

function createIcsFile() {
  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amal Athira Wedding//RSVP//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:amal-athira-wedding-20260823@sivagiri
DTSTAMP:20260424T000000Z
DTSTART:20260823T053000Z
DTEND:20260823T073000Z
SUMMARY:Amal & Athira Wedding
DESCRIPTION:Wedding ceremony of Amal and Athira at Sivagiri Mutt, Varkala.
LOCATION:Sivagiri Mutt, Sivagiri Rd, Varkala
URL:${mapsUrl}
END:VEVENT
END:VCALENDAR
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const privateKey = Buffer.from(
      process.env.GOOGLE_PRIVATE_KEY_B64 || "",
      "base64"
    ).toString("utf8");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString(),
            body.name,
            body.attending ? "Yes" : "No",
            body.guest_count,
            body.email,
            body.phone,
            body.message,
          ],
        ],
      },
    });

    if (body.email) {
      const icsBase64 = Buffer.from(createIcsFile()).toString("base64");

      await resend.emails.send({
        from: "Amal & Athira <noreply@neuverk.com>",
        to: body.email,
        subject: "Thank you for your RSVP – Amal & Athira Wedding",
        html: `
          <div style="font-family: Arial, sans-serif; background:#f7fbff; padding:40px;">
            <div style="max-width:640px; margin:auto; background:#ffffff; border-radius:22px; overflow:hidden; box-shadow:0 18px 45px rgba(11,35,65,0.12);">
              <div style="background:#0b3a6f; color:white; padding:34px; text-align:center;">
                <div style="font-size:34px;">💙</div>
                <h1 style="margin:10px 0 0; font-size:30px; font-family: Georgia, serif;">Amal & Athira</h1>
                <p style="margin:8px 0 0; color:#d7b46a; letter-spacing:2px; text-transform:uppercase; font-size:12px;">
                  Wedding RSVP Confirmed
                </p>
              </div>

              <div style="padding:34px; color:#0b2341; line-height:1.7;">
                <h2 style="margin-top:0;">Thank you, ${body.name}!</h2>

                ${
                  body.attending
                    ? `<p>We are so happy to know that you will be joining us for our wedding celebration.</p>
                       <p><strong>Guests:</strong> ${body.guest_count}</p>`
                    : `<p>Thank you for your wishes. We will miss you on our special day.</p>`
                }

                <div style="background:#f7fbff; border:1px solid #dbe7f4; border-radius:16px; padding:20px; margin:24px 0;">
                  <p style="margin:0;"><strong>Date:</strong> 23 August 2026</p>
                  <p style="margin:8px 0 0;"><strong>Time:</strong> 11:00 AM</p>
                  <p style="margin:8px 0 0;"><strong>Venue:</strong> Sivagiri Mutt, Varkala</p>
                </div>

                <div style="text-align:center; margin-top:28px;">
                  <a href="${mapsUrl}" 
                    style="background:#0b3a6f; color:white; padding:14px 28px; border-radius:10px; text-decoration:none; display:inline-block; font-weight:bold;">
                    Open Wedding Location
                  </a>
                </div>

                <p style="margin-top:34px;">With love,<br/><strong>Amal & Athira</strong></p>
                <p style="font-size:12px; color:#60728a;">
                  A calendar invite is attached to this email.
                </p>
              </div>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: "amal-athira-wedding.ics",
            content: icsBase64,
          },
        ],
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("RSVP error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}