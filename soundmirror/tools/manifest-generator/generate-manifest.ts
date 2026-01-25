#!/usr/bin/env node
/**
 * SoundMirror Sprite Manifest Generator
 * Scans PNG folders and produces sprite manifest JSON files
 * 
 * Usage:
 *   npx ts-node generate-manifest.ts --input ./sprites --output ./sprite_manifests
 *   
 * Or with Node:
 *   node generate-manifest.js --input ./sprites --output ./sprite_manifests
 */

import * as fs from 'fs';
import * as path from 'path';

interface ManifestEntry {
  path: string;
  frames: number;
  fps: number;
  phoneme: string;
  description?: string;
}

interface SpriteManifest {
  version: string;
  generated: string;
  totalFrames: number;
  entries: Record<string, ManifestEntry>;
}

// Phoneme filename to IPA mapping
const FILENAME_TO_IPA: Record<string, string> = {
  'neutral': '_',
  'ah': 'a',
  'ee': 'i',
  'oo': 'u',
  'eh': 'ɛ',
  'oh': 'o',
  'rounded_ee': 'y',
  'sh': 'ʃ',
  'th': 'θ',
  'ng': 'ŋ',
  'ch': 'tʃ',
  'glottal': 'ʔ',
  'welsh_ll': 'ɬ',
  'click': 'ǃ',
};

// IPA to description mapping
const PHONEME_DESCRIPTIONS: Record<string, string> = {
  '_': 'Neutral/closed mouth',
  'a': '"ah" sound (father, spa)',
  'i': '"ee" sound (see, machine)',
  'u': '"oo" sound (food, blue)',
  'ɛ': '"eh" sound (bed, met)',
  'o': '"oh" sound (go)',
  'y': 'Rounded "ee" (French tu)',
  'p': '"p" sound (pat) - lip closure',
  't': '"t" sound (top) - tongue to ridge',
  'd': '"d" sound (dog)',
  'k': '"k" sound (cat) - back of tongue',
  'g': '"g" sound (go)',
  'ʔ': 'Glottal stop (uh-oh)',
  'n': '"n" sound (no)',
  'ŋ': '"ng" sound (sing)',
  's': '"s" sound (see)',
  'ʃ': '"sh" sound (ship)',
  'θ': '"th" sound (think)',
  'f': '"f" sound (fan) - lip-to-teeth',
  'h': '"h" sound (hat) - open breath',
  'tʃ': '"ch" sound (chair)',
  'r': '"r" sound (red)',
  'l': '"l" sound (lip)',
  'ɬ': 'Welsh "ll" (voiceless lateral)',
  'ǃ': 'Dental click (tsk)',
};

/**
 * Scan a directory for PNG files and group by phoneme
 */
function scanSpriteDirectory(dirPath: string): Map<string, string[]> {
  const phonemeFiles = new Map<string, string[]>();
  
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory does not exist: ${dirPath}`);
    return phonemeFiles;
  }
  
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.png'))
    .sort();
  
  for (const file of files) {
    // Parse filename: phoneme_0001.png or phoneme_frame_0001.png
    const match = file.match(/^(.+?)_(\d+)\.png$/);
    if (match) {
      const phonemeName = match[1];
      if (!phonemeFiles.has(phonemeName)) {
        phonemeFiles.set(phonemeName, []);
      }
      phonemeFiles.get(phonemeName)!.push(file);
    }
  }
  
  return phonemeFiles;
}

/**
 * Generate manifest for a single view (front or side)
 */
function generateViewManifest(
  spritesDir: string, 
  view: 'front' | 'side',
  language: string = 'en'
): SpriteManifest {
  const viewPath = path.join(spritesDir, view, language);
  const phonemeFiles = scanSpriteDirectory(viewPath);
  
  const entries: Record<string, ManifestEntry> = {};
  let totalFrames = 0;
  
  for (const [phonemeName, files] of phonemeFiles) {
    const ipaPhoneme = FILENAME_TO_IPA[phonemeName] || phonemeName;
    const relativePath = `sprites/${view}/${language}/${phonemeName}_`;
    
    entries[ipaPhoneme] = {
      path: relativePath,
      frames: files.length,
      fps: 30,  // Default FPS
      phoneme: ipaPhoneme,
      description: PHONEME_DESCRIPTIONS[ipaPhoneme],
    };
    
    totalFrames += files.length;
  }
  
  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalFrames,
    entries,
  };
}

/**
 * Main function - scan sprites and generate manifests
 */
function main(): void {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let inputDir = './assets/sprites';
  let outputDir = './assets/sprite_manifests';
  let languages = ['en', 'es', 'ar', 'universal'];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      inputDir = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--languages' && args[i + 1]) {
      languages = args[i + 1].split(',');
      i++;
    }
  }
  
  console.log('SoundMirror Sprite Manifest Generator');
  console.log('=====================================');
  console.log(`Input directory: ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Languages: ${languages.join(', ')}`);
  console.log('');
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Generate manifests for each view and language
  for (const view of ['front', 'side'] as const) {
    for (const lang of languages) {
      const viewPath = path.join(inputDir, view, lang);
      
      if (!fs.existsSync(viewPath)) {
        console.log(`Skipping ${view}/${lang} - directory not found`);
        continue;
      }
      
      console.log(`Processing ${view}/${lang}...`);
      const manifest = generateViewManifest(inputDir, view, lang);
      
      const outputFile = path.join(outputDir, `${view}_${lang}_manifest.json`);
      fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
      
      console.log(`  Generated: ${outputFile}`);
      console.log(`  Total frames: ${manifest.totalFrames}`);
      console.log(`  Phonemes: ${Object.keys(manifest.entries).length}`);
    }
  }
  
  // Generate combined manifest
  const combinedManifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    views: ['front', 'side'],
    languages,
    manifests: {} as Record<string, string>,
  };
  
  for (const view of ['front', 'side']) {
    for (const lang of languages) {
      const manifestFile = `${view}_${lang}_manifest.json`;
      if (fs.existsSync(path.join(outputDir, manifestFile))) {
        combinedManifest.manifests[`${view}_${lang}`] = manifestFile;
      }
    }
  }
  
  const indexFile = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexFile, JSON.stringify(combinedManifest, null, 2));
  console.log(`\nGenerated index: ${indexFile}`);
  
  console.log('\nDone!');
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateViewManifest, scanSpriteDirectory };
