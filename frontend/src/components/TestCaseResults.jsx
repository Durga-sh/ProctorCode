export default function TestCaseResults({ results }) {
  if (!results) return null;

  const { testCaseResults, finalStatus, score } = results;

  return (
    <div style={{ padding: '16px' }}>
      {/* Summary Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        background: finalStatus === 'ACCEPTED'
          ? 'rgba(16, 185, 129, 0.08)'
          : 'rgba(239, 68, 68, 0.08)',
        borderRadius: '10px',
        border: `1px solid ${finalStatus === 'ACCEPTED'
          ? 'rgba(16, 185, 129, 0.2)'
          : 'rgba(239, 68, 68, 0.2)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>
            {finalStatus === 'ACCEPTED' ? '✅' : '⚠️'}
          </span>
          <div>
            <div style={{
              fontWeight: 700,
              color: finalStatus === 'ACCEPTED' ? 'var(--success)' : 'var(--danger)',
            }}>
              {finalStatus === 'ACCEPTED' ? 'All Tests Passed!' : 'Partial / Failed'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {testCaseResults?.filter(t => t.status === 'PASS').length} / {testCaseResults?.length} test cases passed
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: score >= 100 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)',
        }}>
          {Math.round(score)}%
        </div>
      </div>

      {/* Test Case Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Status</th>
            <th>Runtime</th>
            <th>Input</th>
            <th>Expected</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          {testCaseResults?.map((tc, index) => (
            <tr key={tc.testCaseId || index}>
              <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
              <td>
                <span className={`badge badge-${tc.status.toLowerCase()}`}>
                  {tc.status}
                </span>
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {tc.runtimeMs != null ? `${tc.runtimeMs.toFixed(1)}ms` : '—'}
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tc.isHidden ? '🔒 Hidden' : (tc.input || '(none)')}
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tc.isHidden ? '🔒 Hidden' : tc.expectedOutput}
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: tc.status === 'PASS' ? 'var(--success)' : 'var(--danger)' }}>
                {tc.isHidden ? '🔒 Hidden' : (tc.actualOutput || '(none)')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
