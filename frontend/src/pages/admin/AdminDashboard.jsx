import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await API.get('/exams/my-exams');
      setExams(res.data);
    } catch (err) {
      console.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await API.delete(`/exams/${id}`);
      setExams(exams.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete exam');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);
    if (now < start) return { label: 'Upcoming', className: 'badge-tle' };
    if (now > end) return { label: 'Ended', className: 'badge-fail' };
    return { label: 'Live', className: 'badge-pass' };
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">🎓 Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Manage your coding exams</p>
        </div>
        <button onClick={() => navigate('/admin/create-exam')} className="btn-primary">
          + Create Exam
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Exams', value: exams.length, icon: '📝', color: 'var(--accent-primary)' },
          { label: 'Live Now', value: exams.filter(e => getExamStatus(e).label === 'Live').length, icon: '🟢', color: 'var(--success)' },
          { label: 'Upcoming', value: exams.filter(e => getExamStatus(e).label === 'Upcoming').length, icon: '📅', color: 'var(--warning)' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Exam List */}
      {exams.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>No exams yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Create your first coding exam to get started</p>
          <button onClick={() => navigate('/admin/create-exam')} className="btn-primary" style={{ marginTop: '20px' }}>
            Create Your First Exam
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {exams.map((exam, index) => {
            const status = getExamStatus(exam);
            return (
              <div key={exam.id} className="glass-card animate-slide-up" style={{ padding: '28px', animationDelay: `${index * 0.08}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>{exam.title}</h3>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>

                <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {exam.description?.slice(0, 100) || 'No description'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>⏱ {exam.durationMinutes} min</div>
                  <div style={{ color: 'var(--text-muted)' }}>📝 {exam.questions?.length || 0} questions</div>
                </div>

                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Exam Code</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-secondary)', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
                    {exam.examCode}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => navigate(`/admin/exam/${exam.id}`)} className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>
                    Manage
                  </button>
                  <button onClick={() => navigate(`/admin/exam/${exam.id}/submissions`)} className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>
                    Submissions
                  </button>
                  <button onClick={() => deleteExam(exam.id)} className="btn-danger" style={{ padding: '10px', fontSize: '0.85rem' }}>
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
