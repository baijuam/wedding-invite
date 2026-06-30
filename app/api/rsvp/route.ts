import { google } from "googleapis";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const mapsUrl =
  "https://www.google.com/maps/place/Sivagiri+Mutt/@8.7388845,76.7298358,17z/data=!3m1!4b1!4m6!3m5!1s0x3b05ef2ca32d60d5:0x64ef9b2fa4d6a0fc!8m2!3d8.7388792!4d76.7324107!16zL20vMGRfNWd5";

function createIcsFile() {
  // 10:30 AM IST = 05:00 UTC, 1:00 PM IST = 07:30 UTC
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Amal Athira Wedding//RSVP//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:amal-athira-wedding-20260823@sivagiri",
    "DTSTAMP:20260630T000000Z",
    "DTSTART:20260823T050000Z",
    "DTEND:20260823T073000Z",
    "SUMMARY:Amal & Athira Wedding",
    "DESCRIPTION:Wedding ceremony and celebration of Amal & Athira at Sivagiri Mutt\\, Varkala.",
    "LOCATION:Sivagiri Mutt\\, Sivagiri Rd\\, Varkala\\, Kerala\\, India",
    `URL:${mapsUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

const OWNER_EMAIL =
  process.env.RSVP_TO_EMAIL || "baijuamal97@gmail.com";
const FROM_EMAIL =
  process.env.RSVP_FROM_EMAIL || "Amal & Athira <noreply@neuverk.com>";
const SHEET_NAME = "Sheet1";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.attending === false) {
      if (!body.name || !body.email || !body.message) {
        return Response.json(
          { success: false, error: "Name, email and wishes message are required." },
          { status: 400 }
        );
      }
    } else {
      if (!body.name || !body.email) {
        return Response.json(
          { success: false, error: "Name and email are required." },
          { status: 400 }
        );
      }
    }

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

    // Duplicate check — wrapped in its own try/catch so a Sheets read failure
    // logs but does not crash the request; we proceed to append in that case.
    if (body.email) {
      const normalizedEmail = normalizeEmail(body.email);
      try {
        console.log("Duplicate check started");
        console.log("SHEET_NAME:", SHEET_NAME);
        console.log("Submitted normalized email:", normalizedEmail);

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `${SHEET_NAME}!A:G`,
        });

        const values = response.data.values ?? [];
        const dataRows = values.slice(1);
        console.log("rows length (including header):", values.length);

        const duplicateExists = dataRows.some((row) => {
          const sheetEmail = String(row[4] ?? "").trim().toLowerCase();
          console.log("existing email:", sheetEmail);
          return sheetEmail !== "" && sheetEmail === normalizedEmail;
        });
        console.log("duplicate found:", duplicateExists);

        if (duplicateExists) {
          return Response.json({
            success: true,
            duplicate: true,
            message:
              "This email address has already been used. Your RSVP or wishes have already been delivered successfully.",
          });
        }
      } catch (dupError) {
        console.error("Duplicate check failed, proceeding with append:", dupError);
      }
    }

    const rowData = [
      new Date().toLocaleString(),
      body.name,
      body.attending ? "Yes" : "No",
      body.attending ? body.guest_count : 0,
      body.email || "",
      body.attending ? (body.phone || "") : "",
      body.message || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [rowData] },
    });

    if (body.attending && body.email) {
      try {
        const icsBase64 = Buffer.from(createIcsFile()).toString("base64");

        await resend.emails.send({
          from: FROM_EMAIL,
          to: body.email,
          subject: "Your RSVP has been received - Amal & Athira",
          html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f7f4ee;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f4ee;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#fdfbf6;border:1px solid #e0d9c8;">

          <!-- Header -->
          <tr>
            <td style="padding:48px 40px 32px;text-align:center;border-bottom:3px solid #b59b5b;">
              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#8a7a52;">Amal &amp; Athira</p>
              <h1 style="margin:0;font-size:26px;font-weight:normal;color:#4a5e2a;letter-spacing:1px;">Your RSVP has been received</h1>
              <div style="margin:20px auto 0;width:48px;height:1px;background:#b59b5b;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 8px;color:#3d3d2e;font-size:16px;line-height:1.85;">
              <p style="margin:0 0 18px;">Hi ${body.name},</p>
              <p style="margin:0 0 18px;">Thank you for your RSVP.</p>
              <p style="margin:0 0 32px;">We are happy to know that you will be joining us for our special day. Your response has been received successfully.</p>
            </td>
          </tr>

          <!-- Event details box -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2ede3;border:1px solid #d9cebc;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#8a7a52;">Event Details</p>
                    <div style="margin:10px 0;height:1px;background:#b59b5b;opacity:0.4;"></div>
                    <p style="margin:12px 0 6px;font-size:17px;color:#4a5e2a;letter-spacing:0.5px;">Amal &amp; Athira Wedding</p>
                    <p style="margin:6px 0;font-size:14px;color:#5a5a40;"><strong style="color:#3d3d2e;">Date:</strong> Sunday, 23 August 2026</p>
                    <p style="margin:6px 0;font-size:14px;color:#5a5a40;"><strong style="color:#3d3d2e;">Time:</strong> 10:30 AM &ndash; 1:00 PM</p>
                    <p style="margin:6px 0;font-size:14px;color:#5a5a40;"><strong style="color:#3d3d2e;">Venue:</strong> Sivagiri Mutt, Sivagiri Rd, Varkala</p>
                    <div style="margin:20px 0 4px;">
                      <a href="${mapsUrl}" style="display:inline-block;background-color:#4a5e2a;color:#fdfbf6;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:12px 24px;">Open in Google Maps</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding:0 40px 40px;color:#3d3d2e;font-size:16px;line-height:1.85;">
              <p style="margin:0 0 4px;color:#4a5e2a;">With love,</p>
              <p style="margin:0;font-size:18px;color:#4a5e2a;letter-spacing:1px;">Amal &amp; Athira</p>
              <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9a9070;">A calendar invite is attached to this email.</p>
            </td>
          </tr>

          <!-- Gold divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#b59b5b,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#8a7a52;letter-spacing:2px;text-transform:uppercase;">Sent via Feiera</p>
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#b0a888;">An invitation experience by Feiera</p>
              <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;color:#b0a888;">Part of the Neuverk family</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:9px;color:#c8bfa8;">&copy; 2026 Neuverk. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
          attachments: [
            {
              filename: "amal-athira-wedding.ics",
              content: icsBase64,
            },
          ],
        });
      } catch (emailError) {
        console.error("Failed to send RSVP confirmation email:", emailError);
      }
    }

    if (!body.attending && body.email) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: body.email,
          subject: "Your wishes have been delivered - Amal & Athira",
          html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f7f4ee;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f4ee;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#fdfbf6;border:1px solid #e0d9c8;">

          <!-- Header -->
          <tr>
            <td style="padding:48px 40px 32px;text-align:center;border-bottom:3px solid #b59b5b;">
              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#8a7a52;">Amal &amp; Athira</p>
              <h1 style="margin:0;font-size:26px;font-weight:normal;color:#4a5e2a;letter-spacing:1px;">Thank you for your wishes</h1>
              <div style="margin:20px auto 0;width:48px;height:1px;background:#b59b5b;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;color:#3d3d2e;font-size:16px;line-height:1.85;">
              <p style="margin:0 0 18px;">Hi ${body.name},</p>
              <p style="margin:0 0 18px;">Thank you for sending your wishes to Amal &amp; Athira.</p>
              <p style="margin:0 0 18px;">Although we will miss your presence, your kind words mean a lot to us. Your message has been received and delivered with love.</p>
              <p style="margin:40px 0 0;color:#4a5e2a;">With love,</p>
              <p style="margin:4px 0 0;font-size:18px;color:#4a5e2a;letter-spacing:1px;">Amal &amp; Athira</p>
            </td>
          </tr>

          <!-- Gold divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#b59b5b,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#8a7a52;letter-spacing:2px;text-transform:uppercase;">Sent via Feiera</p>
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#b0a888;">An invitation experience by Feiera</p>
              <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;color:#b0a888;">Part of the Neuverk family</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:9px;color:#c8bfa8;">&copy; 2026 Neuverk. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });
      } catch (emailError) {
        console.error("Failed to send wishes confirmation email:", emailError);
      }
    }

    // Owner notification for all RSVPs
    try {
      if (body.attending) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: OWNER_EMAIL,
          subject: `New RSVP from ${body.name} - Amal & Athira`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #0b2341;">
              <h2>New RSVP Received</h2>
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Attending:</strong> Yes</p>
              <p><strong>Guests:</strong> ${body.guest_count}</p>
              ${body.email ? `<p><strong>Email:</strong> ${body.email}</p>` : ""}
              ${body.phone ? `<p><strong>Phone:</strong> ${body.phone}</p>` : ""}
              ${body.message ? `<p><strong>Message:</strong> ${body.message}</p>` : ""}
            </div>
          `,
        });
      } else {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: OWNER_EMAIL,
          subject: `New wishes from ${body.name} - Amal & Athira`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #0b2341;">
              <h2>New Wishes Received</h2>
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Attending:</strong> No</p>
              ${body.email ? `<p><strong>Email:</strong> ${body.email}</p>` : ""}
              ${body.phone ? `<p><strong>Phone:</strong> ${body.phone}</p>` : ""}
              <p><strong>Wishes / Message:</strong> ${body.message}</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send owner notification email:", emailError);
    }

    return Response.json({ success: true, duplicate: false });
  } catch (error) {
    console.error("RSVP error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}