'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ExportButtonProps {
  onExport: () => Promise<any>;
  label?: string;
}

export function ExportButton({ onExport, label = 'Export CSV' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? 'Exporting...' : label}
    </Button>
  );
}
