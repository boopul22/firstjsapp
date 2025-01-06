import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import debounce from 'lodash/debounce';
import type { editor } from 'monaco-editor';

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
          fontSize: 18,
          fontFamily: 'var(--font-geist-sans)',
          quickSuggestions: { other: false, comments: false, strings: false },
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
          suggest: {
            filterGraceful: false,
            showIcons: false,
            showMethods: false,
            showFunctions: false,
            showConstructors: false,
            showFields: false,
            showVariables: false,
            showClasses: false,
            showStructs: false,
            showInterfaces: false,
            showModules: false,
            showProperties: false,
            showEvents: false,
            showOperators: false,
            showUnits: false,
            showValues: false,
            showConstants: false,
            showEnums: false,
            showEnumMembers: false,
            showKeywords: false,
            showWords: false,
            showColors: false,
            showFiles: false,
            showReferences: false,
            showFolders: false,
            showTypeParameters: false,
            showSnippets: false
          },
          wordWrapColumn: 80,
          wrappingStrategy: 'advanced'
        }}
        className="px-4"
      />
    </div>
  );
}); 