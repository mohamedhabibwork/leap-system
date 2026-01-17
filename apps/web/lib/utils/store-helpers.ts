/**
 * Store helper utilities for common patterns
 */

import { StoreApi, UseBoundStore } from 'zustand';

/**
 * Creates a selector factory for a store
 * This helps prevent unnecessary re-renders by creating memoized selectors
 */
export function createSelectorFactory<T>() {
  return function <R>(selector: (state: T) => R) {
    return selector;
  };
}

/**
 * Helper to create a typed selector
 */
export function createSelector<T, R>(selector: (state: T) => R) {
  return selector;
}

/**
 * Batch multiple store updates to prevent multiple re-renders
 */
export function batchStoreUpdates(updates: Array<() => void>) {
  // Use React's batching (automatic in React 18+)
  updates.forEach((update) => update());
}

/**
 * Helper to create paginated state handlers
 */
export function createPaginationHandlers<T>(
  setState: (partial: Partial<T>) => void,
  getState: () => T,
  key: keyof T
) {
  return {
    nextPage: () => {
      const state = getState();
      const current = state[key] ;
      setState({
        [key]: {
          ...current,
          page: current.page + 1,
        },
      } as Partial<T>);
    },
    prevPage: () => {
      const state = getState();
      const current = state[key] ;
      setState({
        [key]: {
          ...current,
          page: Math.max(1, current.page - 1),
        },
      } as Partial<T>);
    },
    setPage: (page: number) => {
      const state = getState();
      const current = state[key] ;
      setState({
        [key]: {
          ...current,
          page,
        },
      } as Partial<T>);
    },
    setPageSize: (pageSize: number) => {
      const state = getState();
      const current = state[key] ;
      setState({
        [key]: {
          ...current,
          pageSize,
          page: 1, // Reset to first page when changing page size
        },
      } as Partial<T>);
    },
  };
}

/**
 * Helper to create filter handlers
 */
export function createFilterHandlers<T>(
  setState: (partial: Partial<T>) => void,
  getState: () => T,
  key: keyof T
) {
  return {
    setFilter: (filters: any) => {
      setState({
        [key]: filters,
      } as Partial<T>);
    },
    updateFilter: (partialFilters: any) => {
      const state = getState();
      const current = state[key] ;
      setState({
        [key]: {
          ...current,
          ...partialFilters,
        },
      } as Partial<T>);
    },
    clearFilter: () => {
      setState({
        [key]: {},
      } as Partial<T>);
    },
  };
}

/**
 * Helper to create array state handlers (add, remove, toggle)
 */
export function createArrayHandlers<T, Item>(
  setState: (partial: Partial<T>) => void,
  getState: () => T,
  key: keyof T
) {
  return {
    add: (item: Item) => {
      const state = getState();
      const current = (state[key] as Item[]) || [];
      setState({
        [key]: [...current, item],
      } as Partial<T>);
    },
    remove: (predicate: (item: Item) => boolean) => {
      const state = getState();
      const current = (state[key] as Item[]) || [];
      setState({
        [key]: current.filter((item) => !predicate(item)),
      } as Partial<T>);
    },
    update: (predicate: (item: Item) => boolean, updater: (item: Item) => Item) => {
      const state = getState();
      const current = (state[key] as Item[]) || [];
      setState({
        [key]: current.map((item) => (predicate(item) ? updater(item) : item)),
      } as Partial<T>);
    },
    clear: () => {
      setState({
        [key]: [],
      } as Partial<T>);
    },
  };
}

/**
 * Helper to create Set state handlers
 */
export function createSetHandlers<T, Item>(
  setState: (partial: Partial<T>) => void,
  getState: () => T,
  key: keyof T
) {
  return {
    add: (item: Item) => {
      const state = getState();
      const current = (state[key] as Set<Item>) || new Set<Item>();
      const newSet = new Set(current);
      newSet.add(item);
      setState({
        [key]: newSet,
      } as Partial<T>);
    },
    remove: (item: Item) => {
      const state = getState();
      const current = (state[key] as Set<Item>) || new Set<Item>();
      const newSet = new Set(current);
      newSet.delete(item);
      setState({
        [key]: newSet,
      } as Partial<T>);
    },
    toggle: (item: Item) => {
      const state = getState();
      const current = (state[key] as Set<Item>) || new Set<Item>();
      const newSet = new Set(current);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      setState({
        [key]: newSet,
      } as Partial<T>);
    },
    clear: () => {
      setState({
        [key]: new Set(),
      } as Partial<T>);
    },
    has: (item: Item) => {
      const state = getState();
      const current = (state[key] as Set<Item>) || new Set<Item>();
      return current.has(item);
    },
  };
}

/**
 * Helper to persist store to localStorage
 */
export function createLocalStoragePersist<T>(key: string) {
  return {
    getItem: (): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    },
    setItem: (value: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Failed to persist to localStorage:', error);
      }
    },
    removeItem: () => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
      }
    },
  };
}

/**
 * Helper to debounce store updates
 */
export function createDebouncedSetter<T>(
  setter: (value: T) => void,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (value: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setter(value), delay);
  };
}

/**
 * Helper to create computed/derived values from store
 */
export function createComputed<T, R>(
  store: UseBoundStore<StoreApi<T>>,
  compute: (state: T) => R
): () => R {
  return () => compute(store.getState());
}

/**
 * Helper to subscribe to specific store changes
 */
export function subscribeToKey<T, K extends keyof T>(
  store: UseBoundStore<StoreApi<T>>,
  key: K,
  callback: (value: T[K], prevValue: T[K]) => void
) {
  let previousValue = store.getState()[key];

  return store.subscribe((state) => {
    const currentValue = state[key];
    if (currentValue !== previousValue) {
      callback(currentValue, previousValue);
      previousValue = currentValue;
    }
  });
}

/**
 * Type-safe store logger for debugging
 */
export function createStoreLogger<T>(storeName: string) {
  return (config: any) => (set: any, get: any, api: any) => {
    const loggedSet = (partial: any, replace?: boolean, action?: string) => {
      console.log(`[${storeName}] ${action || 'update'}`, {
        previous: get(),
        changes: partial,
      });
      set(partial, replace, action);
      console.log(`[${storeName}] new state:`, get());
    };

    return config(loggedSet, get, api);
  };
}
