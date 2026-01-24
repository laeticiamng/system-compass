import { describe, expect, it } from 'vitest';
import { loadChecklistState, saveChecklistState } from '../checklist-storage';

describe('checklist storage helpers', () => {
  it('returns defaults when storage is unavailable', () => {
    expect(loadChecklistState('missing', 3, null)).toEqual([false, false, false]);
  });

  it('returns defaults when stored data is invalid JSON', () => {
    const storage = {
      getItem: () => 'not-json',
      setItem: () => undefined,
    };

    expect(loadChecklistState('bad', 2, storage)).toEqual([false, false]);
  });

  it('returns defaults when stored data is not an array', () => {
    const storage = {
      getItem: () => JSON.stringify({ value: true }),
      setItem: () => undefined,
    };

    expect(loadChecklistState('bad-shape', 2, storage)).toEqual([false, false]);
  });

  it('normalizes stored data to the requested length', () => {
    const storage = {
      getItem: () => JSON.stringify([true, 0, 'yes', false]),
      setItem: () => undefined,
    };

    expect(loadChecklistState('normalize', 3, storage)).toEqual([true, false, true]);
  });

  it('fills missing values with false when stored array is shorter', () => {
    const storage = {
      getItem: () => JSON.stringify([true]),
      setItem: () => undefined,
    };

    expect(loadChecklistState('short', 3, storage)).toEqual([true, false, false]);
  });

  it('saves checklist state when storage is available', () => {
    let savedKey = '';
    let savedValue = '';
    const storage = {
      getItem: () => null,
      setItem: (key: string, value: string) => {
        savedKey = key;
        savedValue = value;
      },
    };

    saveChecklistState('store', [true, false], storage);

    expect(savedKey).toBe('store');
    expect(savedValue).toBe(JSON.stringify([true, false]));
  });

  it('does nothing when saving without storage', () => {
    expect(() => saveChecklistState('noop', [true], null)).not.toThrow();
  });
});
