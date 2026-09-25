import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function ProblemPanel({ question }) {
  const [sampleCases, setSampleCases] = useState([]);

  useEffect(() => {
    if (question?.id) {
      fetchSampleCases();
    }
  }, [question?.id]);

  const fetchSampleCases = async () => {
    try {
      const res = await API.get(`/testcases/sample/${question.id}`);
      setSampleCases(res.data);
    } catch (err) {
      console.error('Failed to load sample test cases');
    }
  };

  if (!question) {
    return (
      <div className="problem-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
          <p>Select a question to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="problem-panel">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{question.title}</h2>
          <span className={`badge badge-${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <span>⏱ Time Limit: {question.timeLimitMs}ms</span>
          <span>💾 Memory: {question.memoryLimitMb}MB</span>
        </div>
      </div>

      {/* Description */}
      <div style={{
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
        lineHeight: 1.8,
        marginBottom: '28px',
        whiteSpace: 'pre-wrap',
      }}>
        {question.description}
      </div>

      {/* Sample Test Cases */}
      {sampleCases.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Sample Test Cases
          </h3>
          {sampleCases.map((tc, index) => (
            <div key={tc.id} style={{ marginBottom: '20px' }}>
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '8px 16px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Example {index + 1}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ padding: '14px 16px', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>INPUT</div>
                    <pre style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                    }}>{tc.input || '(none)'}</pre>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>OUTPUT</div>
                    <pre style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                    }}>{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
