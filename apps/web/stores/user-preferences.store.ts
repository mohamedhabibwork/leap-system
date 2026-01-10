import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { DashboardLayout, FilterPreset, DisplayPreferences } from './types';

interface UserPreferencesState {
  // Dashboard layouts
  dashboardLayouts: Record<string, DashboardLayout>;
  
  // Saved filter presets
  savedFilters: Record<string, FilterPreset[]>;
  
  // Column visibility preferences
  columnVisibility: Record<string, string[]>;
  
  // Recent searches
  recentSearches: Record<string, string[]>;
  
  // Display preferences
  displayPreferences: DisplayPreferences;
  
  // Actions
  saveDashboardLayout: (page: string, layout: DashboardLayout) => void;
  getDashboardLayout: (page: string) => DashboardLayout | undefined;
  
  saveFilterPreset: (page: string, preset: FilterPreset) => void;
  deleteFilterPreset: (page: string, presetId: string) => void;
  getFilterPresets: (page: string) => FilterPreset[];
  
  setColumnVisibility: (table: string, columns: string[]) => void;
  toggleColumn: (table: string, column: string) => void;
  getVisibleColumns: (table: string) => string[];
  
  addRecentSearch: (context: string, query: string) => void;
  clearRecentSearches: (context: string) => void;
  getRecentSearches: (context: string) => string[];
  
  updateDisplayPreferences: (prefs: Partial<DisplayPreferences>) => void;
  
  reset: () => void;
}

const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  density: 'comfortable',
  theme: 'auto',
  animationsEnabled: true,
  fontSize: 'medium',
};

const MAX_RECENT_SEARCHES = 10;

export const useUserPreferencesStore = create<UserPreferencesState>()(
  devtools(
    persist(
      (set, get) => ({
        dashboardLayouts: {},
        savedFilters: {},
        columnVisibility: {},
        recentSearches: {},
        displayPreferences: DEFAULT_DISPLAY_PREFERENCES,

        saveDashboardLayout: (page, layout) =>
          set(
            (state) => ({
              dashboardLayouts: {
                ...state.dashboardLayouts,
                [page]: layout,
              },
            }),
            false,
            'saveDashboardLayout'
          ),

        getDashboardLayout: (page) => {
          return get().dashboardLayouts[page];
        },

        saveFilterPreset: (page, preset) =>
          set(
            (state) => {
              const pagePresets = state.savedFilters[page] || [];
              const existingIndex = pagePresets.findIndex((p) => p.id === preset.id);
              
              const updatedPresets =
                existingIndex >= 0
                  ? [
                      ...pagePresets.slice(0, existingIndex),
                      preset,
                      ...pagePresets.slice(existingIndex + 1),
                    ]
                  : [...pagePresets, preset];
              
              return {
                savedFilters: {
                  ...state.savedFilters,
                  [page]: updatedPresets,
                },
              };
            },
            false,
            'saveFilterPreset'
          ),

        deleteFilterPreset: (page, presetId) =>
          set(
            (state) => {
              const pagePresets = state.savedFilters[page] || [];
              return {
                savedFilters: {
                  ...state.savedFilters,
                  [page]: pagePresets.filter((p) => p.id !== presetId),
                },
              };
            },
            false,
            'deleteFilterPreset'
          ),

        getFilterPresets: (page) => {
          return get().savedFilters[page] || [];
        },

        setColumnVisibility: (table, columns) =>
          set(
            (state) => ({
              columnVisibility: {
                ...state.columnVisibility,
                [table]: columns,
              },
            }),
            false,
            'setColumnVisibility'
          ),

        toggleColumn: (table, column) =>
          set(
            (state) => {
              const columns = state.columnVisibility[table] || [];
              const isVisible = columns.includes(column);
              
              return {
                columnVisibility: {
                  ...state.columnVisibility,
                  [table]: isVisible
                    ? columns.filter((c) => c !== column)
                    : [...columns, column],
                },
              };
            },
            false,
            'toggleColumn'
          ),

        getVisibleColumns: (table) => {
          return get().columnVisibility[table] || [];
        },

        addRecentSearch: (context, query) =>
          set(
            (state) => {
              const searches = state.recentSearches[context] || [];
              // Remove if already exists to avoid duplicates
              const filtered = searches.filter((s) => s !== query);
              // Add to beginning and limit to MAX_RECENT_SEARCHES
              const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
              
              return {
                recentSearches: {
                  ...state.recentSearches,
                  [context]: updated,
                },
              };
            },
            false,
            'addRecentSearch'
          ),

        clearRecentSearches: (context) =>
          set(
            (state) => ({
              recentSearches: {
                ...state.recentSearches,
                [context]: [],
              },
            }),
            false,
            'clearRecentSearches'
          ),

        getRecentSearches: (context) => {
          return get().recentSearches[context] || [];
        },

        updateDisplayPreferences: (prefs) =>
          set(
            (state) => ({
              displayPreferences: {
                ...state.displayPreferences,
                ...prefs,
              },
            }),
            false,
            'updateDisplayPreferences'
          ),

        reset: () =>
          set(
            {
              dashboardLayouts: {},
              savedFilters: {},
              columnVisibility: {},
              recentSearches: {},
              displayPreferences: DEFAULT_DISPLAY_PREFERENCES,
            },
            false,
            'reset'
          ),
      }),
      {
        name: 'user-preferences',
        // Only persist certain fields
        partialize: (state) => ({
          dashboardLayouts: state.dashboardLayouts,
          savedFilters: state.savedFilters,
          columnVisibility: state.columnVisibility,
          recentSearches: state.recentSearches,
          displayPreferences: state.displayPreferences,
        }),
      }
    ),
    { name: 'user-preferences' }
  )
);

// Selectors
export const selectDashboardLayout = (page: string) => (state: UserPreferencesState) =>
  state.dashboardLayouts[page];

export const selectFilterPresets = (page: string) => (state: UserPreferencesState) =>
  state.savedFilters[page] || [];

export const selectColumnVisibility = (table: string) => (state: UserPreferencesState) =>
  state.columnVisibility[table] || [];

export const selectRecentSearches = (context: string) => (state: UserPreferencesState) =>
  state.recentSearches[context] || [];

export const selectDisplayPreferences = (state: UserPreferencesState) =>
  state.displayPreferences;
