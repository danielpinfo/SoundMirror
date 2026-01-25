Deno.serve((req) => {
  const h = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,HEAD,OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-type": "application/json; charset=utf-8",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method === "HEAD") return new Response(null, { status: 204, headers: h });

  const body = {
    ok: true,
    fn: "bsvtPing",
    build_id: "PING_2026_01_06_A",
    method: req.method,
  };

  return new Response(JSON.stringify(body, null, 2), { status: 200, headers: h });
});