import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [examCode, setExamCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await API.get('/exams');
      setExams(res.data);
    } catch (err) {
      setError('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const joinExam = async (e) => {
    e.preventDefault();
    if (!examCode.trim()) return;

    try {
      const res = await API.get(`/exams/code/${examCode.trim()}`);
      navigate(`/exam/${res.data.id}`);
    } catch (err) {
      setError('Invalid exam code. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);
    if (now < start) return { label: 'Upcoming', className: 'badge-tle' };
    if (now > end) return { label: 'Ended', className: 'badge-fail' };
    return { label: 'Live', className: 'badge-pass' };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">📝 Available Exams</h1>
      <p className="page-subtitle">Join an exam using a code or browse available exams below</p>

      {error && <div className="alert alert-error" style={{ marginBottom: '24px' }}>{error}</div>}

      {/* Join by Code */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="input-label">Join with Exam Code</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter exam code (e.g., A1B2C3D4)"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value.toUpperCase())}
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}
          />
        </div>
        <button onClick={joinExam} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          Join Exam →
        </button>
      </div>

      {/* Exam Grid */}
      {exams.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No exams available yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Check back later or enter an exam code above</p>
        </div>
      ) : (
        <div className="cards-grid">
          {exams.map((exam, index) => {
            const status = getExamStatus(exam);
            return (
              <div
                key={exam.id}
                className="glass-card animate-slide-up"
                style={{ padding: '28px', animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                onClick={() => navigate(`/exam/${exam.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, flex: 1, marginRight: '12px' }}>{exam.title}</h3>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>

                {exam.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
                    {exam.description.length > 120 ? exam.description.slice(0, 120) + '...' : exam.description}
                  </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>
                    ⏱ <strong style={{ color: 'var(--text-secondary)' }}>{exam.durationMinutes} min</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    📝 <strong style={{ color: 'var(--text-secondary)' }}>{exam.questions?.length || 0} questions</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                    🗓 {formatDate(exam.startTime)} — {formatDate(exam.endTime)}
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    Code: {exam.examCode}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
