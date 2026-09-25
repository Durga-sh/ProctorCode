export default function LanguageSelector({ language, onChange }) {
  const languages = [
    { value: 'python', label: 'Python 3', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
  ];

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {languages.map((lang) => (
        <button
          key={lang.value}
          onClick={() => onChange(lang.value)}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: language === lang.value ? '1px solid var(--accent-primary)' : '1px solid transparent',
            background: language === lang.value ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: language === lang.value ? 'var(--accent-secondary)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{lang.icon}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
}
