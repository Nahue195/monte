export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type Persisted<T> = {
  get(): T;
  set(value: T): void;
  subscribe(listener: () => void): () => void;
  refresh(): void;
  serverSnapshot(): T;
};

function browserStorage(): StorageLike | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

// External store for useSyncExternalStore: validated reads, stable snapshots,
// keeps working in memory when storage is blocked, and follows other tabs.
export function createPersisted<T>(
  key: string,
  parse: (raw: unknown) => T,
  empty: T,
  getStorage: () => StorageLike | undefined = browserStorage,
): Persisted<T> {
  let cache: { value: T } | undefined;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  const read = (): T => {
    try {
      const raw = getStorage()?.getItem(key);
      return raw == null ? empty : parse(JSON.parse(raw));
    } catch {
      return empty;
    }
  };

  const store: Persisted<T> = {
    get() {
      cache ??= { value: read() };
      return cache.value;
    },
    set(value) {
      cache = { value };
      try {
        getStorage()?.setItem(key, JSON.stringify(value));
      } catch {
        // Storage full or blocked: keep the value in memory.
      }
      notify();
    },
    refresh() {
      cache = undefined;
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) store.refresh();
      };
      if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
      };
    },
    serverSnapshot: () => empty,
  };
  return store;
}
