import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DriveUploadData {
  fileName: string;
  fileBase64: string;
  mimeType: string;
  folderId: string;
  accessToken: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { fileName, fileBase64, mimeType, folderId, accessToken }: DriveUploadData = await req.json();

    if (!fileName || !fileBase64 || !mimeType || !accessToken) {
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

    const metadata: any = {
      name: fileName,
      mimeType: mimeType,
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    let requestBody = delimiter;
    requestBody += "Content-Type: application/json\r\n\r\n";
    requestBody += JSON.stringify(metadata);
    requestBody += delimiter;
    requestBody += `Content-Type: ${mimeType}\r\n`;
    requestBody += "Content-Transfer-Encoding: base64\r\n\r\n";
    requestBody += fileBase64;
    requestBody += closeDelimiter;

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: requestBody,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Failed to upload to Drive");
    }

    const fileUrl = `https://drive.google.com/file/d/${result.id}/view`;

    return new Response(
      JSON.stringify({ success: true, fileId: result.id, fileUrl: fileUrl }),
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
