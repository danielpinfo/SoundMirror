import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const key = Deno.env.get("AZURE_SPEECH_KEY") || "";
    const region = (Deno.env.get("AZURE_SPEECH_REGION") || "").trim();

    // Don’t leak the key; only report presence + region string
    const envReport = {
      has_key: Boolean(key),
      region: region || null,
    };

    if (!key || !region) {
      return Response.json(
        { ok: false, error: "Azure Speech env vars missing", env: envReport },
        { status: 500 }
      );
    }

    const tokenUrl = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;

    const tokenResp = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Length": "0",
      },
    });

    const tokenText = await tokenResp.text();

    if (!tokenResp.ok) {
      // Return full details so you can see 401/403/etc.
      return Response.json(
        {
          ok: false,
          error: "Failed to issue Azure token",
          env: envReport,
          token_url: tokenUrl,
          status: tokenResp.status,
          details: tokenText,
        },
        { status: 500 }
      );
    }

    // Success
    return Response.json(
      {
        ok: true,
        region,
        token: tokenText,
        expires_hint_seconds: 540,
      },
      { status: 200 }
    );
  } catch (e) {
    return Response.json(
      {
        ok: false,
        error: "Exception",
        message: String(e?.message || e),
      },
      { status: 500 }
    );
  }
});
