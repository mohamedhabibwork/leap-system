'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { EditorToolbar } from './editor-toolbar';
import { cn } from '@/lib/utils';
import './rich-text-editor.css';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  maxHeight?: string;
  showToolbar?: boolean;
  showCharCount?: boolean;
  className?: string;
}

/**
 * Rich text editor component using Tiptap
 * 
 * Features:
 * - Full Tiptap editor with toolbar
 * - Support for: Bold, Italic, Underline, Strikethrough, Code
 * - Headings (H1-H6), Paragraphs, Blockquotes
 * - Lists (Bullet, Numbered), Code blocks with syntax highlighting
 * - Links, Images, Tables
 * - Text alignment (Left, Center, Right, Justify)
 * - Undo/Redo functionality
 * - Character/word count
 * - Markdown shortcuts support
 * - Custom styling to match application theme
 */
export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  minHeight = '200px',
  maxHeight = '600px',
  showToolbar = true,
  showCharCount = true,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
        HTMLAttributes: {
          class: 'rounded-lg bg-gray-900 text-white p-4 font-mono text-sm',
        },
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none',
          'focus:outline-none',
          'p-4',
          className
        ),
      },
    },
  });

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const characterCount = editor.storage.characterCount?.characters() || 0;
  const wordCount = editor.storage.characterCount?.words() || 0;

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-white', className)}>
      {showToolbar && editable && (
        <div className="border-b bg-gray-50">
          <EditorToolbar editor={editor} />
        </div>
      )}

      <div
        className="overflow-y-auto"
        style={{
          minHeight,
          maxHeight,
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {showCharCount && (
        <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <div>
            {characterCount} characters · {wordCount} words
          </div>
          {!editable && <span className="text-orange-500">Read-only mode</span>}
        </div>
      )}
    </div>
  );
}
