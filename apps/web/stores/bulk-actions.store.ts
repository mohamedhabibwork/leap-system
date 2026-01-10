import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { BulkOperation } from './types';

interface BulkActionsState {
  // Selected items by context (e.g., 'admin-users', 'hub-courses')
  selectedItems: Record<string, Set<number>>;
  
  // Bulk operation state
  bulkOperation: BulkOperation;
  
  // Actions
  selectItem: (context: string, id: number) => void;
  deselectItem: (context: string, id: number) => void;
  toggleItem: (context: string, id: number) => void;
  selectAll: (context: string, ids: number[]) => void;
  clearSelection: (context: string) => void;
  clearAllSelections: () => void;
  
  isSelected: (context: string, id: number) => boolean;
  getSelectedCount: (context: string) => number;
  getSelectedIds: (context: string) => number[];
  
  setBulkOperation: (operation: Partial<BulkOperation>) => void;
  startBulkOperation: (type: string, total: number) => void;
  updateBulkProgress: (progress: number) => void;
  completeBulkOperation: () => void;
  failBulkOperation: (error: string) => void;
  resetBulkOperation: () => void;
}

const DEFAULT_BULK_OPERATION: BulkOperation = {
  type: null,
  progress: 0,
  total: 0,
  status: 'idle',
};

export const useBulkActionsStore = create<BulkActionsState>()(
  devtools(
    (set, get) => ({
      selectedItems: {},
      bulkOperation: DEFAULT_BULK_OPERATION,

      selectItem: (context, id) =>
        set(
          (state) => {
            const contextItems = new Set(state.selectedItems[context] || []);
            contextItems.add(id);
            return {
              selectedItems: {
                ...state.selectedItems,
                [context]: contextItems,
              },
            };
          },
          false,
          'selectItem'
        ),

      deselectItem: (context, id) =>
        set(
          (state) => {
            const contextItems = new Set(state.selectedItems[context] || []);
            contextItems.delete(id);
            return {
              selectedItems: {
                ...state.selectedItems,
                [context]: contextItems,
              },
            };
          },
          false,
          'deselectItem'
        ),

      toggleItem: (context, id) => {
        const isSelected = get().isSelected(context, id);
        if (isSelected) {
          get().deselectItem(context, id);
        } else {
          get().selectItem(context, id);
        }
      },

      selectAll: (context, ids) =>
        set(
          (state) => ({
            selectedItems: {
              ...state.selectedItems,
              [context]: new Set(ids),
            },
          }),
          false,
          'selectAll'
        ),

      clearSelection: (context) =>
        set(
          (state) => ({
            selectedItems: {
              ...state.selectedItems,
              [context]: new Set(),
            },
          }),
          false,
          'clearSelection'
        ),

      clearAllSelections: () =>
        set(
          {
            selectedItems: {},
          },
          false,
          'clearAllSelections'
        ),

      isSelected: (context, id) => {
        const contextItems = get().selectedItems[context];
        return contextItems ? contextItems.has(id) : false;
      },

      getSelectedCount: (context) => {
        const contextItems = get().selectedItems[context];
        return contextItems ? contextItems.size : 0;
      },

      getSelectedIds: (context) => {
        const contextItems = get().selectedItems[context];
        return contextItems ? Array.from(contextItems) : [];
      },

      setBulkOperation: (operation) =>
        set(
          (state) => ({
            bulkOperation: { ...state.bulkOperation, ...operation },
          }),
          false,
          'setBulkOperation'
        ),

      startBulkOperation: (type, total) =>
        set(
          {
            bulkOperation: {
              type,
              total,
              progress: 0,
              status: 'processing',
            },
          },
          false,
          'startBulkOperation'
        ),

      updateBulkProgress: (progress) =>
        set(
          (state) => ({
            bulkOperation: { ...state.bulkOperation, progress },
          }),
          false,
          'updateBulkProgress'
        ),

      completeBulkOperation: () =>
        set(
          (state) => ({
            bulkOperation: {
              ...state.bulkOperation,
              progress: state.bulkOperation.total,
              status: 'complete',
            },
          }),
          false,
          'completeBulkOperation'
        ),

      failBulkOperation: (error) =>
        set(
          (state) => ({
            bulkOperation: {
              ...state.bulkOperation,
              status: 'error',
              error,
            },
          }),
          false,
          'failBulkOperation'
        ),

      resetBulkOperation: () =>
        set(
          {
            bulkOperation: DEFAULT_BULK_OPERATION,
          },
          false,
          'resetBulkOperation'
        ),
    }),
    { name: 'bulk-actions' }
  )
);

// Selectors
export const selectSelectedItems = (context: string) => (state: BulkActionsState) =>
  state.selectedItems[context] || new Set<number>();

export const selectSelectedCount = (context: string) => (state: BulkActionsState) =>
  state.selectedItems[context]?.size || 0;

export const selectBulkOperation = (state: BulkActionsState) => state.bulkOperation;

export const selectIsBulkProcessing = (state: BulkActionsState) =>
  state.bulkOperation.status === 'processing';
