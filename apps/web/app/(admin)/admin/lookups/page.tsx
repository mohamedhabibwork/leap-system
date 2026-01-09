'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Database, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAdminLookups, useAdminLookupTypes } from '@/lib/hooks/use-admin-api';
import { SortableLookupList } from '@/components/admin/lookups/sortable-lookup-list';
import { toast } from 'sonner';

export default function AdminLookupsPage() {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; data: any }>({
    open: false,
    data: null,
  });

  const { useList: useListTypes } = useAdminLookupTypes();
  const { useList: useListLookups, useCreate, useUpdate, useDelete, useReorder } = useAdminLookups();

  const { data: typesData } = useListTypes({ limit: 100 });
  const { data: lookupsData, isLoading, refetch } = useListLookups({
    ...(selectedTypeId && { lookupTypeId: selectedTypeId }),
    limit: 100,
  } as any);

  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const reorderMutation = useReorder();

  const handleSave = async (data: any) => {
    try {
      if (editDialog.data?.id) {
        await updateMutation.mutateAsync({ id: editDialog.data.id, data });
        toast.success('Lookup updated successfully');
      } else {
        await createMutation.mutateAsync({ ...data, lookupTypeId: selectedTypeId });
        toast.success('Lookup created successfully');
      }
      setEditDialog({ open: false, data: null });
    } catch (error) {
      toast.error('Failed to save lookup');
    }
  };

  const handleReorder = async (reorderedItems: any[]) => {
    try {
      await reorderMutation.mutateAsync(reorderedItems.map((item, index) => ({
        id: item.id,
        displayOrder: index,
      })));
      toast.success('Order updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, data: { isActive } });
      toast.success(`Lookup ${isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error) {
      toast.error('Failed to update lookup status');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this lookup?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Lookup deleted successfully');
      } catch (error) {
        toast.error('Failed to delete lookup');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lookups Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage system lookup values and types
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lookup Types Panel */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Lookup Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {typesData?.data?.map((type: any) => (
                <Button
                  key={type.id}
                  variant={selectedTypeId === type.id ? 'default' : 'outline'}
                  className="w-full justify-between"
                  onClick={() => setSelectedTypeId(type.id)}
                >
                  <span>{type.name}</span>
                  <Badge variant="secondary">{type.code}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lookup Values Panel */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedTypeId
                  ? typesData?.data?.find((t: any) => t.id === selectedTypeId)?.name
                  : 'Select a Type'}
              </CardTitle>
              {selectedTypeId && (
                <Button
                  size="sm"
                  onClick={() => setEditDialog({ open: true, data: null })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedTypeId ? (
              <div className="text-center py-12 text-muted-foreground">
                Select a lookup type to view and manage its values
              </div>
            ) : isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : lookupsData?.data?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No values found. Add your first value.
              </div>
            ) : (
              <SortableLookupList
                items={lookupsData?.data || []}
                onReorder={handleReorder}
                onToggleActive={handleToggleActive}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, data: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editDialog.data ? 'Edit Lookup Value' : 'Add Lookup Value'}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the lookup value
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave({
                code: formData.get('code'),
                nameEn: formData.get('nameEn'),
                nameAr: formData.get('nameAr'),
                descriptionEn: formData.get('descriptionEn'),
                isActive: formData.get('isActive') === 'true',
              });
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={editDialog.data?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">Name (English) *</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  defaultValue={editDialog.data?.nameEn}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">Name (Arabic)</Label>
                <Input
                  id="nameAr"
                  name="nameAr"
                  defaultValue={editDialog.data?.nameAr}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionEn">Description</Label>
                <Input
                  id="descriptionEn"
                  name="descriptionEn"
                  defaultValue={editDialog.data?.descriptionEn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select
                  name="isActive"
                  defaultValue={editDialog.data?.isActive?.toString() || 'true'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialog({ open: false, data: null })}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
