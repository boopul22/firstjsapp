import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useCallback, useEffect, useRef, forwardRef } from 'react';
import debounce from 'lodash/debounce';
import type { editor } from 'monaco-editor';
import type { MutableRefObject } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
}

export interface EditorRef {
  replaceSelectedText: (newText: string) => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(function Editor(
  { value, onChange, onSave },
  ref
) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Debounce the onChange handler to prevent too many updates
  const debouncedOnChange = useCallback(
    (value: string) => {
      debounce((v: string) => {
        onChange(v);
      }, 500)(value);
    },
    [onChange]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  // Handle editor mount
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  // Implement ref functionality
  useEffect(() => {
    if (ref && typeof ref === 'object') {
      (ref as MutableRefObject<EditorRef>).current = {
        replaceSelectedText: (newText: string) => {
          const editor = editorRef.current;
          if (editor) {
            const selection = editor.getSelection();
            if (selection) {
              editor.executeEdits('', [
                {
                  range: selection,
                  text: newText,
                },
              ]);
            }
          }
        },
      };
    }
  }, [ref]);

  return (
    <div className="h-full p-4">
      <MonacoEditor
        height="100%"
        defaultLanguage="markdown"
        theme="vs"
        value={value}
        onChange={(value) => value && debouncedOnChange(value)}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'off',
          folding: false,
          renderWhitespace: 'none',
          fontSize: 16,
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          parameterHints: { enabled: false },
          codeLens: false,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          renderLineHighlight: 'none',
          scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
            useShadows: false,
          },
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
        }}
      />
    </div>
  );
}); 