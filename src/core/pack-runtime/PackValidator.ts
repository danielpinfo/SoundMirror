import type { LanguagePackModule } from './packTypes';

export function validatePackContract(pack: LanguagePackModule) {
  const required = ['manifest','getPlaybackRate','resolveUnits','buildAnimationTimeline','synthesize'];
  for (const key of required) {
    if (!(key in pack)) throw new Error(`Invalid pack: missing ${key}`);
  }
}