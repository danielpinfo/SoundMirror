import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * DEPRECATED: This function now just redirects to getPhonemes.
 * Use getPhonemes directly for all phoneme analysis.
 * 
 * This wrapper exists for backwards compatibility only.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    console.log('[analyzePhonemes] DEPRECATED: Redirecting to getPhonemes');
    
    // Forward to the unified getPhonemes function
    console.log('[analyzePhonemes] Calling getPhonemes with:', body.audioFileUrl);
    const result = await base44.functions.invoke('getPhonemes', {
      audioFileUrl: body.audioFileUrl,
      lang: body.lang || 'eng',
      targetText: body.targetText
    });

    console.log('[analyzePhonemes] Got result:', JSON.stringify(result.data || result));
    
    // result from invoke is {data: {...}} - return the data directly
    return Response.json(result.data || result);

  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});