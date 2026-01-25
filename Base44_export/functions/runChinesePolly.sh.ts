#!/bin/bash
# One-command Chinese Polly audio generator
# Just copy/paste this entire file into CloudShell and run: bash runChinesePolly.sh

echo "🎙️  Setting up Chinese Polly audio generator..."

# Install dependencies
npm install @aws-sdk/client-polly

# Create the JavaScript file
cat > generateChinesePollyAudio.js << 'EOFJS'
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CHINESE_LETTERS = [
  { letter: '啊', token: 'ah' },
  { letter: '波', token: 'ba' },
  { letter: '次', token: 'ca' },
  { letter: '得', token: 'da' },
  { letter: '鹅', token: 'eh' },
  { letter: '佛', token: 'fa' },
  { letter: '哥', token: 'ga' },
  { letter: '喝', token: 'ha' },
  { letter: '衣', token: 'ih' },
  { letter: '鸡', token: 'ja' },
  { letter: '科', token: 'ka' },
  { letter: '勒', token: 'la' },
  { letter: '摸', token: 'ma' },
  { letter: '讷', token: 'na' },
  { letter: '哦', token: 'oh' },
  { letter: '坡', token: 'pa' },
  { letter: '七', token: 'kwa' },
  { letter: '日', token: 'ra' },
  { letter: '思', token: 'sa' },
  { letter: '特', token: 'ta' },
  { letter: '乌', token: 'uh' },
  { letter: '西', token: 'za' },
  { letter: '鱼', token: 'ya' },
  { letter: '资', token: 'za' },
];

const polly = new PollyClient({ region: 'us-east-1' });
const OUTPUT_DIR = './chinese-audio-output';

async function generateAudio(letter, token) {
  console.log(\`Generating audio for \${letter} (zh-\${token}.mp3)...\`);

  const params = {
    Text: letter,
    OutputFormat: 'mp3',
    VoiceId: 'Zhiyu',
    Engine: 'neural',
    LanguageCode: 'cmn-CN',
  };

  try {
    const command = new SynthesizeSpeechCommand(params);
    const response = await polly.send(command);
    
    const audioStream = response.AudioStream;
    const chunks = [];
    
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    const filename = \`zh-\${token}.mp3\`;
    const filepath = join(OUTPUT_DIR, filename);
    writeFileSync(filepath, audioBuffer);
    
    console.log(\`✅ Generated: \${filename} (\${audioBuffer.length} bytes)\`);
    return true;
  } catch (error) {
    console.error(\`❌ Failed to generate \${letter}:\`, error.message);
    return false;
  }
}

async function main() {
  console.log('🎙️  AWS Polly Chinese Audio Generator\n');
  console.log(\`Total letters to generate: \${CHINESE_LETTERS.length}\n\`);
  
  try {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(\`📁 Output directory: \${OUTPUT_DIR}\n\`);
  } catch (error) {
    console.error('Failed to create output directory:', error.message);
    process.exit(1);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const { letter, token } of CHINESE_LETTERS) {
    const success = await generateAudio(letter, token);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(\`✅ Success: \${successCount}\`);
  console.log(\`❌ Failed: \${failCount}\`);
  console.log('='.repeat(50));
  console.log(\`\n📦 Files ready in: \${OUTPUT_DIR}\`);
}

main().catch(console.error);
EOFJS

# Run the generator
echo ""
echo "🚀 Running audio generator..."
node generateChinesePollyAudio.js

# Upload to S3
echo ""
echo "📤 Uploading to S3..."
aws s3 cp chinese-audio-output/ s3://soundmirror-phoneme-audio/ --recursive

echo ""
echo "✅ Done! All Chinese audio files uploaded to S3."