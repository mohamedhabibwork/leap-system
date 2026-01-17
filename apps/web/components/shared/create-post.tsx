'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
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
import { Image, Video, Smile, Send, File as FileIcon, X } from 'lucide-react';
import { useCreatePost } from '@/lib/hooks/use-api';
import { toast } from 'sonner';
import { MentionTextarea } from './mention-textarea';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';

interface CreatePostProps {
  context: 'timeline' | 'group' | 'page';
  contextId?: number;
  placeholder?: string;
  onPostCreated?: (post: any) => void;
}

export function CreatePost({
  context,
  contextId,
  placeholder,
  onPostCreated,
}: CreatePostProps) {
  const t = useTranslations('common.create.post');
  const params = useParams();
  const locale = (params.locale as 'en' | 'ar') || 'en';
  
  // Fetch lookups for post_type and visibility
  const { data: postTypes, isLoading: postTypesLoading } = useLookupsByType(LookupTypeCode.POST_TYPE);
  const { data: visibilityTypes, isLoading: visibilityTypesLoading } = useLookupsByType(LookupTypeCode.POST_VISIBILITY);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mentionIds, setMentionIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPost = useCreatePost();
  
  const defaultPlaceholder = placeholder || t('placeholder');
  
  // Helper function to get localized lookup name
  const getLookupName = (lookup: any) => {
    return locale === 'ar' && lookup.nameAr ? lookup.nameAr : lookup.nameEn;
  };
  
  // Initialize visibility from lookups when loaded
  useEffect(() => {
    if (visibilityTypes && visibilityTypes.length > 0) {
      // Check if current visibility exists in lookups
      const currentVisibilityExists = visibilityTypes.some(v => v.code === visibility);
      if (!currentVisibilityExists) {
        // If current visibility doesn't exist, set to default from lookups
        const defaultVisibility = visibilityTypes.find(v => v.code === 'public')?.code || visibilityTypes[0]?.code || 'public';
        setVisibility(defaultVisibility);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibilityTypes]);

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error(t('writeSomethingOrAddFiles'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine post type based on files, using lookup codes
      let post_type = 'text'; // Default to text
      
      if (selectedFiles.length > 0 && postTypes) {
        const firstFile = selectedFiles[0];
        let determinedType = 'text';
        
        if (firstFile.type.startsWith('image/')) {
          determinedType = 'image';
        } else if (firstFile.type.startsWith('video/')) {
          determinedType = 'video';
        } else {
          determinedType = 'link';
        }
        
        // Validate that the determined type exists in lookups
        const validType = postTypes.find(pt => pt.code === determinedType);
        if (validType) {
          post_type = validType.code;
        } else {
          // Fallback to first available post type if determined type not found
          post_type = postTypes[0]?.code || 'text';
        }
      } else if (postTypes && postTypes.length > 0) {
        // Default to first available post type (usually 'text')
        post_type = postTypes.find(pt => pt.code === 'text')?.code || postTypes[0]?.code || 'text';
      }
      
      // Validate visibility code exists in lookups
      let visibilityCode = visibility;
      if (visibilityTypes) {
        const validVisibility = visibilityTypes.find(v => v.code === visibility);
        if (!validVisibility && visibilityTypes.length > 0) {
          visibilityCode = visibilityTypes.find(v => v.code === 'public')?.code || visibilityTypes[0]?.code || 'public';
        }
      }

      const postData: any = {
        content: content.trim() || '',
        post_type,
        visibility: visibilityCode,
      };

      if (context === 'group' && contextId) {
        postData.group_id = contextId;
      } else if (context === 'page' && contextId) {
        postData.page_id = contextId;
      }

      // Add mentionIds if any users are mentioned
      if (mentionIds.length > 0) {
        postData.mentionIds = mentionIds;
      }

      // Send files directly with the post (multipart/form-data)
      await createPost.mutateAsync({ data: postData, files: selectedFiles });
      
      toast.success(t('success'));
      setContent('');
      setSelectedFiles([]);
      setMentionIds([]);
      setIsExpanded(false);
      onPostCreated?.(postData);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      toast.error(error?.response?.data?.message || t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, accept?: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 10) {
      toast.error(t('maxFiles'));
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={undefined} />
          <AvatarFallback>{t('avatarFallback')}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {!isExpanded ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsExpanded(true)}
            >
              {defaultPlaceholder}
            </Button>
          ) : (
            <div className="space-y-3">
              <MentionTextarea
                value={content}
                onChange={setContent}
                onMentionsChange={setMentionIds}
                placeholder={defaultPlaceholder}
                rows={4}
                autoFocus
              />

              {/* File Previews */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {selectedFiles.map((file, index) => {
                      const preview = getFilePreview(file);
                      return (
                        <div key={index} className="relative aspect-square border rounded-lg overflow-hidden bg-muted">
                          {preview ? (
                            <img
                              src={preview}
                              alt={t('preview', { index: index + 1 })}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                            {file.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedFiles.length === 1
                      ? t('filesSelected', { count: selectedFiles.length })
                      : t('filesSelectedPlural', { count: selectedFiles.length })}
                  </p>
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Image className="h-4 w-4" aria-label={t('uploadImage')} />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'image/*')}
                        aria-label={t('uploadImage')}
                      />
                    </label>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Video className="h-4 w-4" aria-label={t('uploadVideo')} />
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'video/*')}
                        aria-label={t('uploadVideo')}
                      />
                    </label>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <label className="cursor-pointer">
                      <FileIcon className="h-4 w-4" aria-label={t('uploadFile')} />
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e)}
                        aria-label={t('uploadFile')}
                      />
                    </label>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                {context === 'timeline' && (
                  <Select 
                    value={visibility} 
                    onValueChange={setVisibility}
                    disabled={visibilityTypesLoading}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t('visibilityPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityTypesLoading ? (
                        <SelectItem value="loading" disabled>
                          {t('loading')}
                        </SelectItem>
                      ) : visibilityTypes && visibilityTypes.length > 0 ? (
                        visibilityTypes.map((visibilityType) => (
                          <SelectItem key={visibilityType.id} value={visibilityType.code}>
                            {getLookupName(visibilityType)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          {t('noOptions')}
                        </SelectItem>
                      )}
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
                    setSelectedFiles([]);
                    setMentionIds([]);
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={(!content.trim() && selectedFiles.length === 0) || isSubmitting || createPost.isPending}
                >
                  {isSubmitting || createPost.isPending ? (
                    t('posting')
                  ) : (
                    <>
                      <Send className="me-2 h-4 w-4" />
                      {t('postButton')}
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
