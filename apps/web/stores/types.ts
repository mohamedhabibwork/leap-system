// Shared types across all stores

export interface FilterState {
  search?: string;
  status?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  category?: string;
  tags?: string[];
  [key: string]: any;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total?: number;
}

export interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

export interface DateRange {
  start: Date;
  end: Date;
  preset: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area';
  metrics: string[];
  colors?: string[];
  options?: Record<string, any>;
}

export interface WidgetState {
  visible: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface DashboardLayout {
  widgets: string[];
  columns: number;
  customCSS?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: Date;
}

export interface DisplayPreferences {
  density: 'compact' | 'comfortable' | 'spacious';
  theme: 'light' | 'dark' | 'auto';
  animationsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface BulkOperation {
  type: string | null;
  progress: number;
  total: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields: string[];
  filters?: FilterState;
  dateRange?: DateRange;
}
