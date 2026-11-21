import 'server-only';

type CacheItem<T> = { value: T; expiresAt: number };
const store = new Map<string, CacheItem<unknown>>();

export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as CacheItem<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  const value = await loader();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export const TTL = {
  short: 60_000,
  medium: 15 * 60_000,
  long: 24 * 60 * 60_000,
};
