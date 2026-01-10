import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FilterState, PaginationState, SortState } from './types';

interface DashboardUIState {
  // Filters by page
  filters: Record<string, FilterState>;
  // Pagination by page
  pagination: Record<string, PaginationState>;
  // Sort by page
  sorting: Record<string, SortState>;
  // Active tabs
  activeTabs: Record<string, string>;
  // Modals/Drawers
  modals: Record<string, boolean>;
  // View modes (grid/list)
  viewModes: Record<string, 'grid' | 'list'>;
  
  // Actions
  setFilter: (page: string, filters: FilterState) => void;
  updateFilter: (page: string, partialFilters: Partial<FilterState>) => void;
  clearFilters: (page: string) => void;
  
  setPagination: (page: string, pagination: PaginationState) => void;
  updatePagination: (page: string, partial: Partial<PaginationState>) => void;
  
  setSorting: (page: string, sorting: SortState) => void;
  
  setActiveTab: (page: string, tab: string) => void;
  
  toggleModal: (modal: string) => void;
  openModal: (modal: string) => void;
  closeModal: (modal: string) => void;
  
  setViewMode: (page: string, mode: 'grid' | 'list') => void;
  
  resetPageState: (page: string) => void;
  resetAllStates: () => void;
}

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 20,
};

export const useDashboardUIStore = create<DashboardUIState>()(
  devtools(
    (set) => ({
      filters: {},
      pagination: {},
      sorting: {},
      activeTabs: {},
      modals: {},
      viewModes: {},

      setFilter: (page, filters) =>
        set(
          (state) => ({
            filters: { ...state.filters, [page]: filters },
          }),
          false,
          'setFilter'
        ),

      updateFilter: (page, partialFilters) =>
        set(
          (state) => ({
            filters: {
              ...state.filters,
              [page]: { ...state.filters[page], ...partialFilters },
            },
          }),
          false,
          'updateFilter'
        ),

      clearFilters: (page) =>
        set(
          (state) => ({
            filters: { ...state.filters, [page]: {} },
          }),
          false,
          'clearFilters'
        ),

      setPagination: (page, pagination) =>
        set(
          (state) => ({
            pagination: { ...state.pagination, [page]: pagination },
          }),
          false,
          'setPagination'
        ),

      updatePagination: (page, partial) =>
        set(
          (state) => ({
            pagination: {
              ...state.pagination,
              [page]: {
                ...(state.pagination[page] || DEFAULT_PAGINATION),
                ...partial,
              },
            },
          }),
          false,
          'updatePagination'
        ),

      setSorting: (page, sorting) =>
        set(
          (state) => ({
            sorting: { ...state.sorting, [page]: sorting },
          }),
          false,
          'setSorting'
        ),

      setActiveTab: (page, tab) =>
        set(
          (state) => ({
            activeTabs: { ...state.activeTabs, [page]: tab },
          }),
          false,
          'setActiveTab'
        ),

      toggleModal: (modal) =>
        set(
          (state) => ({
            modals: { ...state.modals, [modal]: !state.modals[modal] },
          }),
          false,
          'toggleModal'
        ),

      openModal: (modal) =>
        set(
          (state) => ({
            modals: { ...state.modals, [modal]: true },
          }),
          false,
          'openModal'
        ),

      closeModal: (modal) =>
        set(
          (state) => ({
            modals: { ...state.modals, [modal]: false },
          }),
          false,
          'closeModal'
        ),

      setViewMode: (page, mode) =>
        set(
          (state) => ({
            viewModes: { ...state.viewModes, [page]: mode },
          }),
          false,
          'setViewMode'
        ),

      resetPageState: (page) =>
        set(
          (state) => {
            const newState = { ...state };
            delete newState.filters[page];
            delete newState.pagination[page];
            delete newState.sorting[page];
            delete newState.activeTabs[page];
            delete newState.viewModes[page];
            return newState;
          },
          false,
          'resetPageState'
        ),

      resetAllStates: () =>
        set(
          {
            filters: {},
            pagination: {},
            sorting: {},
            activeTabs: {},
            modals: {},
            viewModes: {},
          },
          false,
          'resetAllStates'
        ),
    }),
    { name: 'dashboard-ui' }
  )
);

// Selectors for optimized re-renders
export const selectPageFilters = (page: string) => (state: DashboardUIState) =>
  state.filters[page] || {};

export const selectPagePagination = (page: string) => (state: DashboardUIState) =>
  state.pagination[page] || DEFAULT_PAGINATION;

export const selectPageSorting = (page: string) => (state: DashboardUIState) =>
  state.sorting[page];

export const selectActiveTab = (page: string) => (state: DashboardUIState) =>
  state.activeTabs[page];

export const selectModalState = (modal: string) => (state: DashboardUIState) =>
  state.modals[modal] || false;

export const selectViewMode = (page: string) => (state: DashboardUIState) =>
  state.viewModes[page] || 'grid';
