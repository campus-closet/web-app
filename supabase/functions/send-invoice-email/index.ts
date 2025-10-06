import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  pdfBase64?: string;
  pdfFilename?: string;
  smtpConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: EmailData = await req.json();

    const { to, subject, htmlContent, pdfBase64, pdfFilename, smtpConfig } = data;

    if (!to || !subject || !htmlContent || !smtpConfig) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const boundary = "----=_Part_" + Date.now();
    let emailBody = `From: ${smtpConfig.from}\r\n`;
    emailBody += `To: ${to}\r\n`;
    emailBody += `Subject: ${subject}\r\n`;
    emailBody += `MIME-Version: 1.0\r\n`;
    emailBody += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

    emailBody += `--${boundary}\r\n`;
    emailBody += `Content-Type: text/html; charset="UTF-8"\r\n`;
    emailBody += `Content-Transfer-Encoding: quoted-printable\r\n\r\n`;
    emailBody += `${htmlContent}\r\n\r\n`;

    if (pdfBase64 && pdfFilename) {
      emailBody += `--${boundary}\r\n`;
      emailBody += `Content-Type: application/pdf; name="${pdfFilename}"\r\n`;
      emailBody += `Content-Transfer-Encoding: base64\r\n`;
      emailBody += `Content-Disposition: attachment; filename="${pdfFilename}"\r\n\r\n`;
      emailBody += `${pdfBase64}\r\n\r\n`;
    }

    emailBody += `--${boundary}--`;

    const smtpUrl = `smtps://${smtpConfig.user}:${smtpConfig.password}@${smtpConfig.host}:${smtpConfig.port}`;

    const response = await fetch(smtpUrl, {
      method: "POST",
      body: emailBody,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
