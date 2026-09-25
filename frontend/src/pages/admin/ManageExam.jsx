import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';

export default function ManageExam() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Question form
  const [questionForm, setQuestionForm] = useState({
    title: '', description: '', difficulty: 'EASY', timeLimitMs: 5000, memoryLimitMb: 256,
  });

  // Test case form
  const [testCaseForm, setTestCaseForm] = useState({
    questionId: '', input: '', expectedOutput: '', isHidden: false,
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showTestCaseForm, setShowTestCaseForm] = useState(null); // questionId

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        API.get(`/exams/${id}`),
        API.get(`/questions/${id}`),
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      console.error('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    try {
      await API.post('/questions', { ...questionForm, examId: parseInt(id) });
      setQuestionForm({ title: '', description: '', difficulty: 'EASY', timeLimitMs: 5000, memoryLimitMb: 256 });
      setShowQuestionForm(false);
      fetchData();
    } catch (err) {
      alert('Failed to add question');
    }
  };

  const deleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question and all its test cases?')) return;
    try {
      await API.delete(`/questions/${qId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  const addTestCase = async (e, questionId) => {
    e.preventDefault();
    try {
      await API.post('/testcases', { ...testCaseForm, questionId });
      setTestCaseForm({ questionId: '', input: '', expectedOutput: '', isHidden: false });
      setShowTestCaseForm(null);
      fetchData();
    } catch (err) {
      alert('Failed to add test case');
    }
  };

  const deleteTestCase = async (tcId) => {
    if (!window.confirm('Delete this test case?')) return;
    try {
      await API.delete(`/testcases/${tcId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete test case');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <Link to="/admin/dashboard" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
        ← Back to Dashboard
      </Link>

      {/* Exam Info */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{exam?.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{exam?.description}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Exam Code</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-secondary)', letterSpacing: '0.1em' }}>
              {exam?.examCode}
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Questions ({questions.length})</h2>
        <button onClick={() => setShowQuestionForm(!showQuestionForm)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
          {showQuestionForm ? 'Cancel' : '+ Add Question'}
        </button>
      </div>

      {/* Question Form */}
      {showQuestionForm && (
        <div className="glass-card animate-slide-up" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>New Question</h3>
          <form onSubmit={addQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label">Title</label>
              <input type="text" className="input-field" placeholder="e.g., Two Sum" value={questionForm.title}
                onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })} required />
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea className="input-field" placeholder="Problem description with examples..." rows={6}
                value={questionForm.description}
                onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })} required
                style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label className="input-label">Difficulty</label>
                <select className="select-field" value={questionForm.difficulty}
                  onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="input-label">Time Limit (ms)</label>
                <input type="number" className="input-field" value={questionForm.timeLimitMs}
                  onChange={(e) => setQuestionForm({ ...questionForm, timeLimitMs: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="input-label">Memory (MB)</label>
                <input type="number" className="input-field" value={questionForm.memoryLimitMb}
                  onChange={(e) => setQuestionForm({ ...questionForm, memoryLimitMb: parseInt(e.target.value) })} />
              </div>
            </div>
            <button type="submit" className="btn-success" style={{ alignSelf: 'flex-end', padding: '10px 24px' }}>
              Add Question
            </button>
          </form>
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
          <p style={{ color: 'var(--text-secondary)' }}>No questions added yet. Click "Add Question" above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, index) => (
            <div key={q.id} className="glass-card animate-slide-up" style={{ padding: '24px', animationDelay: `${index * 0.08}s` }}>
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: 'white',
                  }}>
                    {index + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{q.title}</h3>
                    <span className={`badge badge-${q.difficulty.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowTestCaseForm(showTestCaseForm === q.id ? null : q.id)}
                    className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    + Test Case
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="btn-danger" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    Delete
                  </button>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                {q.description.length > 200 ? q.description.slice(0, 200) + '...' : q.description}
              </p>

              {/* Test Case Form */}
              {showTestCaseForm === q.id && (
                <div style={{
                  background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px',
                  marginBottom: '16px', border: '1px solid var(--border)',
                }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Add Test Case</h4>
                  <form onSubmit={(e) => addTestCase(e, q.id)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label className="input-label">Input</label>
                        <textarea className="input-field" rows={3} placeholder="stdin input"
                          value={testCaseForm.input}
                          onChange={(e) => setTestCaseForm({ ...testCaseForm, input: e.target.value })}
                          style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label className="input-label">Expected Output</label>
                        <textarea className="input-field" rows={3} placeholder="expected stdout"
                          value={testCaseForm.expectedOutput}
                          onChange={(e) => setTestCaseForm({ ...testCaseForm, expectedOutput: e.target.value })}
                          required style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={testCaseForm.isHidden}
                          onChange={(e) => setTestCaseForm({ ...testCaseForm, isHidden: e.target.checked })}
                          style={{ accentColor: 'var(--accent-primary)' }} />
                        Hidden test case (not visible to students)
                      </label>
                      <button type="submit" className="btn-success" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Existing Test Cases */}
              {q.testCases?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Test Cases ({q.testCases.length})
                  </div>
                  {q.testCases.map((tc, tcIdx) => (
                    <div key={tc.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '6px',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', flex: 1 }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{tcIdx + 1}</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          in: {tc.input?.slice(0, 30) || '(none)'}
                        </span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          out: {tc.expectedOutput?.slice(0, 30)}
                        </span>
                        {tc.isHidden && <span className="badge badge-ce" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Hidden</span>}
                      </div>
                      <button onClick={() => deleteTestCase(tc.id)} style={{
                        background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem',
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
