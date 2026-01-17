'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Search, Grid, List, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MediaItem {
  id: number;
  url: string;
  filename: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
}

interface ImageGalleryProps {
  items: MediaItem[];
  onDelete?: (ids: number[]) => void;
  onSelect?: (item: MediaItem) => void;
  selectedIds?: number[];
  className?: string;
  viewMode?: 'grid' | 'list';
  searchable?: boolean;
  selectable?: boolean;
}

/**
 * Image gallery component with grid/list view
 * 
 * Features:
 * - Grid and list layout views
 * - Select multiple images
 * - Delete confirmation
 * - Lightbox view
 * - Search/filter images
 * - Pagination
 */
export function ImageGallery({
  items,
  onDelete,
  onSelect,
  selectedIds = [],
  className,
  viewMode: initialViewMode = 'grid',
  searchable = true,
  selectable = true,
}: ImageGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set(selectedIds));
  const [lightboxImage, setLightboxImage] = useState<MediaItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    setSelectedItems(new Set(filteredItems.map((item) => item.id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleDelete = () => {
    if (onDelete && selectedItems.size > 0) {
      onDelete(Array.from(selectedItems));
      setSelectedItems(new Set());
      setDeleteDialogOpen(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectable && selectedItems.size > 0 && (
            <>
              <span className="text-sm text-gray-600">
                {selectedItems.size} selected
              </span>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}

          {selectable && selectedItems.size === 0 && (
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
          )}

          {/* View mode toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No images found matching your search' : 'No images yet'}
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer',
                selectedItems.has(item.id) && 'border-primary ring-2 ring-primary/20'
              )}
              onClick={() => onSelect?.(item)}
            >
              {/* Checkbox */}
              {selectable && (
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    className="bg-white"
                  />
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage(item);
                  }}
                >
                  View
                </Button>
              </div>

              {/* Filename */}
              <div className="p-2 bg-white">
                <p className="text-xs font-medium truncate">{item.filename}</p>
                <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && filteredItems.length > 0 && (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
                selectedItems.has(item.id) && 'bg-primary/5 border-primary'
              )}
              onClick={() => onSelect?.(item)}
            >
              {/* Checkbox */}
              {selectable && (
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                />
              )}

              {/* Thumbnail */}
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                <Image src={item.url} alt={item.filename} fill className="object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.filename}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatFileSize(item.size)}</span>
                  {item.mimeType && <span>{item.mimeType}</span>}
                  {item.createdAt && (
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* View button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImage(item);
                }}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox dialog */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogDescription className="sr-only">
            Image preview - {lightboxImage?.filename || 'Image'}
          </DialogDescription>
          {lightboxImage && (
            <div className="space-y-4">
              <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={lightboxImage.url}
                  alt={lightboxImage.filename}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-2">
                <p className="font-medium">{lightboxImage.filename}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatFileSize(lightboxImage.size)}</span>
                  {lightboxImage.mimeType && <span>{lightboxImage.mimeType}</span>}
                  {lightboxImage.createdAt && (
                    <span>{new Date(lightboxImage.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Images</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.size} image
              {selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
