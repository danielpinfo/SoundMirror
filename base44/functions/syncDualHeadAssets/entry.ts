Deno.serve(() => {
  return Response.json(
    { error: 'Disabled legacy function' },
    { status: 410 }
  );
});