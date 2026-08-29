import type { LanguagePackModule, PackId } from './packTypes';

const registry = new Map<PackId, () => Promise<LanguagePackModule>>();

export function registerPack(id: PackId, loader: () => Promise<LanguagePackModule>) {
  registry.set(id, loader);
}

export function hasPack(id: PackId) {
  return registry.has(id);
}

export async function loadPack(id: PackId): Promise<LanguagePackModule> {
  const loader = registry.get(id);
  if (!loader) throw new Error(`Pack not registered: ${id}`);
  return loader();
}

export function listPacks(): PackId[] {
  return Array.from(registry.keys());
}