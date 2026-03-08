import { describe, it, expect, beforeEach } from 'vitest';

// Test localStorage-based storage (not Firebase)
// We test the storage API contract
describe('storage API (localStorage)', () => {
  let storage;

  beforeEach(async () => {
    localStorage.clear();
    // Import the localStorage-based storage module
    const mod = await import('../storage.js');
    storage = mod.default;
  });

  it('set and get a value', async () => {
    await storage.set('test-key', 'hello');
    const result = await storage.get('test-key');
    expect(result).toEqual({ key: 'test-key', value: 'hello' });
  });

  it('get returns null for missing key', async () => {
    const result = await storage.get('nonexistent');
    expect(result).toBeNull();
  });

  it('delete removes a key', async () => {
    await storage.set('to-delete', 'value');
    await storage.delete('to-delete');
    const result = await storage.get('to-delete');
    expect(result).toBeNull();
  });

  it('list returns keys with prefix', async () => {
    await storage.set('app_tasks', '[]');
    await storage.set('app_xp', '{}');
    await storage.set('other', 'x');
    const result = await storage.list('app_');
    expect(result.keys).toContain('app_tasks');
    expect(result.keys).toContain('app_xp');
    expect(result.keys).not.toContain('other');
  });

  it('list returns all keys without prefix', async () => {
    await storage.set('a', '1');
    await storage.set('b', '2');
    const result = await storage.list();
    expect(result.keys.length).toBeGreaterThanOrEqual(2);
  });

  it('set overwrites existing value', async () => {
    await storage.set('key', 'v1');
    await storage.set('key', 'v2');
    const result = await storage.get('key');
    expect(result.value).toBe('v2');
  });
});
