import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import { useCallback, useEffect, forwardRef } from 'react';
import type { MutableRefObject } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onFormat?: (format: string) => void;
}

export interface EditorRef {
  replaceSelectedText: (newText: string) => void;
  handleFormat: (format: string) => void;
  insertImage?: (url: string, alt?: string) => void;
  insertLink?: (url: string, text?: string) => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(function Editor(
  { value, onChange, onSave },
  ref
) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      Bold,
      Italic,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: 'Start writing or type / for commands...',
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-md p-4 font-mono text-sm',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleFormat = useCallback((format: string) => {
    if (!editor) return;

    switch (format) {
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'bullet':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'number':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'align-left':
        editor.chain().focus().setTextAlign('left').run();
        break;
      case 'align-center':
        editor.chain().focus().setTextAlign('center').run();
        break;
      case 'align-right':
        editor.chain().focus().setTextAlign('right').run();
        break;
      case 'align-justify':
        editor.chain().focus().setTextAlign('justify').run();
        break;
      case 'code':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'quote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'clear-format':
        editor.chain().focus().clearNodes().unsetAllMarks().run();
        break;
    }
  }, [editor]);

  const insertImage = useCallback((url: string, alt?: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
    }
  }, [editor]);

  const insertLink = useCallback((url: string, text?: string) => {
    if (editor) {
      if (text) {
        editor.chain().focus().insertContent({
          type: 'text',
          marks: [{ type: 'link', attrs: { href: url } }],
          text,
        }).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
      // Add WordPress-like keyboard shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch(e.key) {
          case 'b':
            e.preventDefault();
            handleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            handleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            handleFormat('underline');
            break;
          case 'k':
            e.preventDefault();
            const url = prompt('Enter URL:');
            if (url) insertLink(url);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, handleFormat, insertLink]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Implement ref functionality
  useEffect(() => {
    if (ref && typeof ref === 'object') {
      (ref as MutableRefObject<EditorRef>).current = {
        replaceSelectedText: (newText: string) => {
          if (editor) {
            editor.commands.insertContent(newText);
          }
        },
        handleFormat,
        insertImage,
        insertLink,
      };
    }
  }, [ref, handleFormat, editor, insertImage, insertLink]);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="h-full">
          <EditorContent 
            editor={editor} 
            className="prose max-w-none h-full focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[calc(100vh-200px)] [&_.ProseMirror]:p-4 [&_.ProseMirror>*:first-child]:mt-0 [&_.ProseMirror>*]:leading-normal [&_.ProseMirror_p]:my-3 [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ul,&_.ProseMirror_ol]:pl-[24px] [&_.ProseMirror_li]:my-1.5 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gray-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror]:placeholder:text-gray-400 [&_.ProseMirror_p]:max-w-full [&_.ProseMirror_p]:break-words [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-auto [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_code]:p-3 [&_.ProseMirror_code]:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}); 