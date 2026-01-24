export type ChecklistStorage = Pick<Storage, 'getItem' | 'setItem'>;

const createDefaultState = (length: number) => new Array<boolean>(length).fill(false);

export const loadChecklistState = (
  storageKey: string,
  length: number,
  storage?: ChecklistStorage | null,
) => {
  if (length <= 0) {
    return [];
  }

  const resolvedStorage =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : null);

  if (!resolvedStorage) {
    return createDefaultState(length);
  }

  const saved = resolvedStorage.getItem(storageKey);

  if (!saved) {
    return createDefaultState(length);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(saved);
  } catch {
    return createDefaultState(length);
  }

  if (!Array.isArray(parsed)) {
    return createDefaultState(length);
  }

  return Array.from({ length }, (_, index) => Boolean(parsed[index]));
};

export const saveChecklistState = (
  storageKey: string,
  checkedItems: boolean[],
  storage?: ChecklistStorage | null,
) => {
  const resolvedStorage =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : null);

  if (!resolvedStorage) {
    return;
  }

  resolvedStorage.setItem(storageKey, JSON.stringify(checkedItems));
};
