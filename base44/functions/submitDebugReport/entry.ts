import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(()=>({}));
    const reporter = body.email || null;
    const details = body.details || '';
    const summary = body.summary || 'SoundMirror user-submitted debug report';
    const logs = body.logs || null;

    const subject = `[SoundMirror Debug] ${summary}`;
    const lines = [
      `Reporter: ${reporter || 'anonymous'}`,
      '',
      'Details:',
      details,
      '',
      logs ? `Logs (JSON):\n${JSON.stringify(logs,null,2)}` : ''
    ].join('\n');

    await base44.integrations.Core.SendEmail({
      to: 'daniel@soundmirrortech.com',
      subject,
      body: lines
    });

    return Response.json({ status: 'ok' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});