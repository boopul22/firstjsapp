import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import debounce from 'lodash/debounce';
import type { editor } from 'monaco-editor';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onSelectionChange?: (
    selection: string,
    range?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }
  ) => void;
}

export interface EditorRef {
  replaceSelectedText: (newText: string) => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(function Editor(
  { value, onChange, onSave, onSelectionChange },
  ref
) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    replaceSelectedText: (newText: string) => {
      if (!editorRef.current) return;
      
      const editor = editorRef.current;
      const selection = editor.getSelection();
      const model = editor.getModel();
      
      if (!selection || !model) return;

      // Get the original text with its formatting
      const originalText = model.getValueInRange(selection);
      
      // Normalize both texts by removing extra whitespace
      const normalizedOriginal = originalText.trim();
      const normalizedNew = newText.trim();

      // If original text had a trailing newline, preserve it
      const hasTrailingNewline = originalText.endsWith('\n');
      
      // If original text had leading/trailing spaces, preserve them
      const leadingSpaces = originalText.match(/^\s*/)?.[0] || '';
      const trailingSpaces = originalText.match(/\s*$/)?.[0] || '';

      // Reconstruct the text with original formatting
      const finalText = leadingSpaces + normalizedNew + trailingSpaces;

      editor.executeEdits('rewrite', [{
        range: selection,
        text: finalText,
        forceMoveMarkers: true
      }]);

      // Trigger onChange after edit
      const newValue = editor.getValue();
      debouncedOnChange(newValue);
    }
  }), []);

  // Debounce the onChange handler to prevent too many updates
  const debouncedOnChange = useCallback(
    debounce((value: string) => {
      onChange(value);
    }, 500),
    [onChange]
  );

  // Handle selection changes
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorSelection((e) => {
      const model = editor.getModel();
      if (model) {
        const selection = model.getValueInRange(e.selection);
        if (selection && onSelectionChange) {
          onSelectionChange(selection, e.selection);
        } else if (onSelectionChange) {
          onSelectionChange('');
        }
      }
    });
  };

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

  return (
    <div className="h-full w-full rounded-lg bg-white shadow-sm">
      <MonacoEditor
        height="100%"
        defaultLanguage="markdown"
        theme="vs-light"
        value={value}
        onChange={(value) => value && debouncedOnChange(value)}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'off',
          folding: false,
          renderWhitespace: 'none',
          scrollBeyondLastLine: false,
          fontSize: 18,
          fontFamily: 'var(--font-geist-sans)',
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          parameterHints: { enabled: false },
          codeLens: false,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          renderLineHighlight: 'none',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            alwaysConsumeMouseWheel: false
          },
          padding: {
            top: 24,
            bottom: 24
          },
          lineHeight: 1.8,
          letterSpacing: 0.3,
          rulers: [],
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          cursorBlinking: 'smooth',
          cursorStyle: 'line',
          cursorWidth: 2,
          contextmenu: false,
          wordWrapColumn: 80,
          wrappingStrategy: 'advanced'
        }}
        className="px-4"
      />
    </div>
  );
}); 