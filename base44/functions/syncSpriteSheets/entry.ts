import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * syncSpriteSheets
 *
 * Publishes the two universal sprite sheets from the GitHub source
 * repository to Base44 file storage/CDN.
 *
 * IMPORTANT:
 * - GitHub remains the source asset location.
 * - This function does NOT use AnimationAsset.
 * - This function does NOT create database records.
 * - The returned CDN URLs may be placed into universalSpriteMetadata.
 */

const SPRITE_SHEETS = [
  {
    asset_name: 'front_universal_20',
    file_name: 'front_universal_20.png',
    github_url:
      'https://github.com/danielpinfo/SoundMirror/raw/Heads_front-_side/soundmirror_universal_sprite_assets_v2_5x4%20(1)/front_universal_20.png',
  },
  {
    asset_name: 'side_universal_20',
    file_name: 'side_universal_20.png',
    github_url:
      'https://github.com/danielpinfo/SoundMirror/raw/Heads_front-_side/soundmirror_universal_sprite_assets_v2_5x4%20(1)/side_universal_20.png',
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const githubToken = Deno.env.get('Github');

    const headers = githubToken
      ? { Authorization: `token ${githubToken}` }
      : {};

    const uploaded_assets = [];

    for (const sheet of SPRITE_SHEETS) {
      const response = await fetch(sheet.github_url, { headers });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${sheet.file_name}: HTTP ${response.status}`
        );
      }

      const blob = await response.blob();

      const file = new File(
        [blob],
        sheet.file_name,
        { type: 'image/png' }
      );

      const upload =
        await base44.asServiceRole.integrations.Core.UploadFile({
          file,
        });

      uploaded_assets.push({
        asset_name: sheet.asset_name,
        github_url: sheet.github_url,
        cdn_url: upload.file_url,
      });
    }

    return Response.json({
      uploaded_assets,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
});