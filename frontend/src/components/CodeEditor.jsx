import Editor from '@monaco-editor/react';

export default function CodeEditor({ language, value, onChange }) {
  const monacoLanguage = {
    python: 'python',
    java: 'java',
    cpp: 'cpp',
  }[language] || 'python';

  return (
    <Editor
      height="100%"
      language={monacoLanguage}
      value={value}
      onChange={(val) => onChange(val || '')}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16 },
        lineNumbers: 'on',
        roundedSelection: true,
        automaticLayout: true,
        tabSize: 4,
        wordWrap: 'on',
        suggest: { showKeywords: true },
        bracketPairColorization: { enabled: true },
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
      }}
    />
  );
}
