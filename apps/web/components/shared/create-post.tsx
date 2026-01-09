'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image, Video, Smile, Send } from 'lucide-react';
import { useCreatePost } from '@/lib/hooks/use-api';
import { useFileUpload } from '@/lib/hooks/use-upload';
import { toast } from 'sonner';

interface CreatePostProps {
  context: 'timeline' | 'group' | 'page';
  contextId?: number;
  placeholder?: string;
  onPostCreated?: (post: any) => void;
}

export function CreatePost({
  context,
  contextId,
  placeholder = "What's on your mind?",
  onPostCreated,
}: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const createPost = useCreatePost();
  const uploadFile = useFileUpload();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }

    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        toast.info('Uploading images...');
        const uploadPromises = selectedImages.map((file) =>
          uploadFile.upload({ file, folder: 'posts' })
        );
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map((result: any) => result.url);
      }

      const postData: any = {
        content,
        entityType: context,
        visibility,
        images: imageUrls,
      };

      if (context === 'group' && contextId) {
        postData.groupId = contextId;
      } else if (context === 'page' && contextId) {
        postData.pageId = contextId;
      }

      await createPost.mutateAsync(postData);
      toast.success('Post created successfully!');
      setContent('');
      setSelectedImages([]);
      setIsExpanded(false);
      onPostCreated?.(postData);
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src="/avatar-placeholder.png" />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {!isExpanded ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsExpanded(true)}
            >
              {placeholder}
            </Button>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="resize-none"
                autoFocus
              />

              {/* Image Previews */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() =>
                          setSelectedImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <label>
                      <Image className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                {context === 'timeline' && (
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="only_me">Only Me</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent('');
                    setSelectedImages([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || createPost.isPending || uploadFile.isUploading}
                >
                  {uploadFile.isUploading ? (
                    'Uploading...'
                  ) : createPost.isPending ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
