import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Results() {
  const { examId } = useParams();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    try {
      const [examRes, subRes] = await Promise.all([
        API.get(`/exams/${examId}`),
        API.get(`/results/${user.userId}/${examId}`),
      ]);
      setExam(examRes.data);
      setSubmissions(subRes.data);
    } catch (err) {
      console.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  // Calculate total score
  const totalScore = submissions.length > 0
    ? (submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <Link to="/dashboard" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
        ← Back to Dashboard
      </Link>

      <h1 className="page-title">📊 Exam Results</h1>
      {exam && <p className="page-subtitle">{exam.title}</p>}

      {/* Score Summary */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '8px',
          color: totalScore >= 80 ? 'var(--success)' : totalScore >= 50 ? 'var(--warning)' : 'var(--danger)',
        }}>
          {totalScore}%
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Average Score across {submissions.length} submission(s)
        </div>
      </div>

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
          <h3 style={{ color: 'var(--text-secondary)' }}>No submissions yet</h3>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Language</th>
                <th>Status</th>
                <th>Score</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, index) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{sub.question?.title || `Q${sub.question?.id}`}</td>
                  <td>
                    <span style={{
                      background: 'var(--bg-elevated)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {sub.language}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${sub.finalStatus === 'ACCEPTED' ? 'badge-pass' : 'badge-fail'}`}>
                      {sub.finalStatus}
                    </span>
                  </td>
                  <td style={{
                    fontWeight: 700,
                    color: sub.score >= 100 ? 'var(--success)' : sub.score >= 50 ? 'var(--warning)' : 'var(--danger)',
                  }}>
                    {Math.round(sub.score)}%
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {formatDate(sub.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
