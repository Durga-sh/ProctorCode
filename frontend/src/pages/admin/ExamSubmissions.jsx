import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';

export default function ExamSubmissions() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [examRes, subRes] = await Promise.all([
        API.get(`/exams/${id}`),
        API.get(`/results/exam/${id}`),
      ]);
      setExam(examRes.data);
      setSubmissions(subRes.data);
    } catch (err) {
      console.error('Failed to load submissions');
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

  // Group by student
  const studentMap = {};
  submissions.forEach(sub => {
    const studentId = sub.user?.id;
    if (!studentMap[studentId]) {
      studentMap[studentId] = {
        name: sub.user?.name || 'Unknown',
        email: sub.user?.email || '',
        submissions: [],
      };
    }
    studentMap[studentId].submissions.push(sub);
  });

  const students = Object.entries(studentMap).map(([id, data]) => {
    const avgScore = data.submissions.reduce((sum, s) => sum + (s.score || 0), 0) / data.submissions.length;
    return { id, ...data, avgScore };
  }).sort((a, b) => b.avgScore - a.avgScore);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1100px' }}>
      <Link to="/admin/dashboard" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
        ← Back to Dashboard
      </Link>

      <h1 className="page-title">📊 Submissions</h1>
      {exam && <p className="page-subtitle">{exam.title} — {submissions.length} total submissions from {students.length} students</p>}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{students.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Students</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{submissions.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Submissions</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>
            {students.length > 0 ? (students.reduce((s, st) => s + st.avgScore, 0) / students.length).toFixed(1) : 0}%
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Avg Score</div>
        </div>
      </div>

      {/* Student Leaderboard */}
      {students.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
          <h3 style={{ color: 'var(--text-secondary)' }}>No submissions yet</h3>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Email</th>
                <th>Submissions</th>
                <th>Avg Score</th>
                <th>Best Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700,
                      background: index === 0 ? 'rgba(245, 158, 11, 0.15)' : index === 1 ? 'rgba(148, 163, 184, 0.15)' : index === 2 ? 'rgba(180, 83, 9, 0.15)' : 'var(--bg-elevated)',
                      color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : 'var(--text-muted)',
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{student.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{student.email}</td>
                  <td>{student.submissions.length}</td>
                  <td style={{
                    fontWeight: 700,
                    color: student.avgScore >= 80 ? 'var(--success)' : student.avgScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                  }}>
                    {student.avgScore.toFixed(1)}%
                  </td>
                  <td>
                    {student.submissions.some(s => s.finalStatus === 'ACCEPTED') ? (
                      <span className="badge badge-pass">ACCEPTED</span>
                    ) : (
                      <span className="badge badge-fail">PARTIAL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed Submissions */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '32px 0 16px' }}>All Submissions</h2>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Question</th>
              <th>Language</th>
              <th>Status</th>
              <th>Score</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, index) => (
              <tr key={sub.id}>
                <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{sub.user?.name}</td>
                <td>{sub.question?.title}</td>
                <td>
                  <span style={{
                    background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: '4px',
                    fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                  }}>{sub.language}</span>
                </td>
                <td>
                  <span className={`badge ${sub.finalStatus === 'ACCEPTED' ? 'badge-pass' : 'badge-fail'}`}>
                    {sub.finalStatus}
                  </span>
                </td>
                <td style={{
                  fontWeight: 700,
                  color: sub.score >= 100 ? 'var(--success)' : sub.score >= 50 ? 'var(--warning)' : 'var(--danger)',
                }}>{Math.round(sub.score)}%</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(sub.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
