'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  MoreVertical,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminLookups, useAdminLookupTypes } from '@/lib/hooks/use-admin-api';
import { SortableLookupList } from '@/components/admin/lookups/sortable-lookup-list';
import { toast } from 'sonner';
import { PageLoader } from '@/components/loading/page-loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminLookupsPage() {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  
  // Lookup types dialogs
  const [typeDialog, setTypeDialog] = useState<{ open: boolean; data: any }>({
    open: false,
    data: null,
  });
  
  // Lookup values dialogs
  const [lookupDialog, setLookupDialog] = useState<{ open: boolean; data: any }>({
    open: false,
    data: null,
  });

  const { useList: useListTypes, useCreate: useCreateType, useUpdate: useUpdateType, useDelete: useDeleteType } = useAdminLookupTypes();
  const { useList: useListLookups, useCreate, useUpdate, useDelete, useReorder } = useAdminLookups();

  const { data: typesData, isLoading: typesLoading, refetch: refetchTypes } = useListTypes({ limit: 100 });
  const { data: lookupsData, isLoading: lookupsLoading, refetch: refetchLookups } = useListLookups({
    ...(selectedTypeId && { lookupTypeId: selectedTypeId }),
    search: searchQuery || undefined,
    isActive: isActiveFilter,
    sortBy,
    sortOrder,
    page,
    limit,
  } );

  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const reorderMutation = useReorder();
  
  const createTypeMutation = useCreateType();
  const updateTypeMutation = useUpdateType();
  const deleteTypeMutation = useDeleteType();

  const lookups = lookupsData?.data || [];
  const pagination = lookupsData?.pagination;

  const handleSaveLookup = async (data: any) => {
    try {
      if (lookupDialog.data?.id) {
        await updateMutation.mutateAsync({ id: lookupDialog.data.id, data });
        toast.success('Lookup updated successfully');
      } else {
        await createMutation.mutateAsync({ ...data, lookupTypeId: selectedTypeId });
        toast.success('Lookup created successfully');
      }
      setLookupDialog({ open: false, data: null });
      refetchLookups();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save lookup');
    }
  };

  const handleSaveType = async (data: any) => {
    try {
      if (typeDialog.data?.id) {
        await updateTypeMutation.mutateAsync({ id: typeDialog.data.id, data });
        toast.success('Lookup type updated successfully');
      } else {
        await createTypeMutation.mutateAsync(data);
        toast.success('Lookup type created successfully');
      }
      setTypeDialog({ open: false, data: null });
      refetchTypes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save lookup type');
    }
  };

  const handleDeleteType = async (id: number) => {
    if (confirm('Are you sure you want to delete this lookup type? This will also delete all associated lookups.')) {
      try {
        await deleteTypeMutation.mutateAsync(id);
        toast.success('Lookup type deleted successfully');
        if (selectedTypeId === id) {
          setSelectedTypeId(null);
        }
        refetchTypes();
      } catch (error) {
        toast.error('Failed to delete lookup type');
      }
    }
  };

  const handleDeleteLookup = async (id: number) => {
    if (confirm('Are you sure you want to delete this lookup?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Lookup deleted successfully');
        refetchLookups();
      } catch (error) {
        toast.error('Failed to delete lookup');
      }
    }
  };

  const handleReorder = async (reorderedItems: any[]) => {
    try {
      await reorderMutation.mutateAsync(reorderedItems.map((item, index) => ({
        id: item.id,
        displayOrder: index,
      })));
      toast.success('Order updated successfully');
      refetchLookups();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, data: { isActive } });
      toast.success(`Lookup ${isActive ? 'activated' : 'deactivated'} successfully`);
      refetchLookups();
    } catch (error) {
      toast.error('Failed to update lookup status');
    }
  };

  const handleBulkOperation = async (operation: string) => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one lookup');
      return;
    }

    if (operation === 'delete' && !confirm(`Are you sure you want to delete ${selectedIds.length} lookup(s)?`)) {
      return;
    }

    try {
      // Bulk operations would need to be implemented in the backend
      // For now, we'll do individual operations
      if (operation === 'delete') {
        await Promise.all(selectedIds.map(id => deleteMutation.mutateAsync(id)));
        toast.success(`Deleted ${selectedIds.length} lookup(s)`);
      } else if (operation === 'activate') {
        await Promise.all(selectedIds.map(id => updateMutation.mutateAsync({ id, data: { isActive: true } })));
        toast.success(`Activated ${selectedIds.length} lookup(s)`);
      } else if (operation === 'deactivate') {
        await Promise.all(selectedIds.map(id => updateMutation.mutateAsync({ id, data: { isActive: false } })));
        toast.success(`Deactivated ${selectedIds.length} lookup(s)`);
      }
      setSelectedIds([]);
      refetchLookups();
    } catch (error) {
      toast.error('Failed to perform bulk operation');
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === lookups.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(lookups.map((l: any) => l.id));
    }
  };

  if (typesLoading) {
    return <PageLoader message="Loading lookup types..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lookups Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage system lookup values and types
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setTypeDialog({ open: true, data: null })}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Type
          </Button>
        </div>
      </div>

      <Tabs defaultValue="lookups" className="w-full">
        <TabsList>
          <TabsTrigger value="lookups">Lookups</TabsTrigger>
          <TabsTrigger value="types">Lookup Types</TabsTrigger>
        </TabsList>

        {/* Lookups Tab */}
        <TabsContent value="lookups" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-4">
            {/* Lookup Types Sidebar */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5" />
                  Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  <Button
                    variant={selectedTypeId === null ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedTypeId(null)}
                  >
                    All Types
                  </Button>
                  {typesData?.data?.map((type: any) => (
                    <div key={type.id} className="flex items-center gap-2">
                      <Button
                        variant={selectedTypeId === type.id ? 'default' : 'ghost'}
                        className="flex-1 justify-between"
                        onClick={() => {
                          setSelectedTypeId(type.id);
                          setPage(1);
                        }}
                      >
                        <span className="truncate">{type.name}</span>
                        <Badge variant="secondary" className="ml-2">{type.code}</Badge>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTypeDialog({ open: true, data: type })}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteType(type.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lookups Main Panel */}
            <Card className="md:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedTypeId
                      ? typesData?.data?.find((t: any) => t.id === selectedTypeId)?.name
                      : 'All Lookups'}
                  </CardTitle>
                  {selectedTypeId && (
                    <Button
                      size="sm"
                      onClick={() => setLookupDialog({ open: true, data: null })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lookup
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search lookups..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={isActiveFilter === undefined ? 'all' : isActiveFilter.toString()}
                    onValueChange={(value) => {
                      setIsActiveFilter(value === 'all' ? undefined : value === 'true');
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="nameEn">Name (EN)</SelectItem>
                      <SelectItem value="nameAr">Name (AR)</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="displayOrder">Display Order</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'list' ? 'table' : 'list')}
                  >
                    {viewMode === 'list' ? 'Table' : 'List'}
                  </Button>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{selectedIds.length} selected</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkOperation('activate')}
                    >
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkOperation('deactivate')}
                    >
                      Deactivate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkOperation('delete')}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIds([])}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Content */}
                {!selectedTypeId ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Select a lookup type to view and manage its values
                  </div>
                ) : lookupsLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading...</div>
                ) : lookups.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No lookups found. Add your first lookup.
                  </div>
                ) : viewMode === 'list' ? (
                  <SortableLookupList
                    items={lookups}
                    onReorder={handleReorder}
                    onToggleActive={handleToggleActive}
                    onEdit={(id) => {
                      const lookup = lookups.find((l: any) => l.id === id);
                      setLookupDialog({ open: true, data: lookup });
                    }}
                    onDelete={handleDeleteLookup}
                  />
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedIds.length === lookups.length && lookups.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Name (EN)</TableHead>
                          <TableHead>Name (AR)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lookups.map((lookup: any) => (
                          <TableRow key={lookup.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(lookup.id)}
                                onCheckedChange={() => toggleSelection(lookup.id)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{lookup.code}</TableCell>
                            <TableCell>{lookup.nameEn}</TableCell>
                            <TableCell dir="rtl">{lookup.nameAr || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={lookup.isActive ? 'default' : 'secondary'}>
                                {lookup.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>{lookup.displayOrder || lookup.sortOrder || '-'}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setLookupDialog({ open: true, data: lookup })}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleActive(lookup.id, !lookup.isActive)}>
                                    {lookup.isActive ? (
                                      <>
                                        <X className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteLookup(lookup.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={limit.toString()}
                        onValueChange={(value) => {
                          setLimit(Number(value));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page >= pagination.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lookup Types Tab */}
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lookup Types</CardTitle>
                <Button onClick={() => setTypeDialog({ open: true, data: null })}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typesData?.data?.map((type: any) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="font-mono text-sm">{type.code}</TableCell>
                      <TableCell>{type.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTypeDialog({ open: true, data: type })}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteType(type.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lookup Type Dialog */}
      <Dialog open={typeDialog.open} onOpenChange={(open) => setTypeDialog({ open, data: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {typeDialog.data ? 'Edit Lookup Type' : 'Create Lookup Type'}
            </DialogTitle>
            <DialogDescription>
              {typeDialog.data ? 'Update lookup type details' : 'Create a new lookup type'}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveType({
                name: formData.get('name'),
                code: formData.get('code'),
                description: formData.get('description'),
              });
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type-name">Name *</Label>
                <Input
                  id="type-name"
                  name="name"
                  defaultValue={typeDialog.data?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type-code">Code *</Label>
                <Input
                  id="type-code"
                  name="code"
                  defaultValue={typeDialog.data?.code}
                  required
                  pattern="[a-z_]+"
                  title="Lowercase letters and underscores only"
                />
                <p className="text-xs text-muted-foreground">
                  Use lowercase letters and underscores (e.g., user_status)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type-description">Description</Label>
                <Input
                  id="type-description"
                  name="description"
                  defaultValue={typeDialog.data?.description}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTypeDialog({ open: false, data: null })}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lookup Value Dialog */}
      <Dialog open={lookupDialog.open} onOpenChange={(open) => setLookupDialog({ open, data: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {lookupDialog.data ? 'Edit Lookup Value' : 'Add Lookup Value'}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the lookup value
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveLookup({
                code: formData.get('code'),
                nameEn: formData.get('nameEn'),
                nameAr: formData.get('nameAr'),
                descriptionEn: formData.get('descriptionEn'),
                descriptionAr: formData.get('descriptionAr'),
                isActive: formData.get('isActive') === 'true',
                displayOrder: formData.get('displayOrder') ? Number(formData.get('displayOrder')) : undefined,
              });
            }}
          >
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={lookupDialog.data?.code}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">Name (English) *</Label>
                  <Input
                    id="nameEn"
                    name="nameEn"
                    defaultValue={lookupDialog.data?.nameEn}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameAr">Name (Arabic)</Label>
                  <Input
                    id="nameAr"
                    name="nameAr"
                    defaultValue={lookupDialog.data?.nameAr}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">Description (English)</Label>
                  <Input
                    id="descriptionEn"
                    name="descriptionEn"
                    defaultValue={lookupDialog.data?.descriptionEn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                  <Input
                    id="descriptionAr"
                    name="descriptionAr"
                    defaultValue={lookupDialog.data?.descriptionAr}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    defaultValue={lookupDialog.data?.displayOrder || lookupDialog.data?.sortOrder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <Select
                    name="isActive"
                    defaultValue={lookupDialog.data?.isActive?.toString() || 'true'}
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLookupDialog({ open: false, data: null })}>
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
