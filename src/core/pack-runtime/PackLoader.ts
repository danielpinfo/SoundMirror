import { registerPack } from './PackRegistry';

// Register dynamic imports here. Keep side-effect import minimal.
// Example for en_us
registerPack('en_us', async () => (await import('@/languagepacks/en_us/index.js')).default);