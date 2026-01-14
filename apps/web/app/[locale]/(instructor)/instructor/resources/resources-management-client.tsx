'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function ResourcesManagementClient() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Resources</h1>
          <p className="text-gray-600">Upload and manage course materials</p>
        </div>
        <Button asChild>
          <Link href="/instructor/resources/create">
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Link>
        </Button>
      </div>

      <Card className="p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Resource Management</h2>
        <p className="text-gray-500 mb-4">
          Upload documents, videos, and other materials for your courses. Resources can be attached at course, section, or lesson level.
        </p>
        <Button asChild>
          <Link href="/instructor/resources/create">Upload First Resource</Link>
        </Button>
      </Card>
    </div>
  );
}
