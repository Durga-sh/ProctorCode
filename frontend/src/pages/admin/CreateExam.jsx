import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function CreateExam() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    durationMinutes: 60,
    startTime: '',
    endTime: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        durationMinutes: parseInt(form.durationMinutes),
      };
      const res = await API.post('/exams', payload);
      navigate(`/admin/exam/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <h1 className="page-title">📋 Create New Exam</h1>
      <p className="page-subtitle">Set up a coding exam for your students</p>

      <div className="glass-card" style={{ padding: '36px' }}>
        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="input-label">Exam Title *</label>
            <input
              type="text"
              name="title"
              className="input-field"
              placeholder="e.g., Data Structures Final Exam"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea
              name="description"
              className="input-field"
              placeholder="Describe what this exam covers..."
              value={form.description}
              onChange={handleChange}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label className="input-label">Duration (minutes) *</label>
            <input
              type="number"
              name="durationMinutes"
              className="input-field"
              value={form.durationMinutes}
              onChange={handleChange}
              min={1}
              max={480}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label className="input-label">Start Time *</label>
              <input
                type="datetime-local"
                name="startTime"
                className="input-field"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="input-label">End Time *</label>
              <input
                type="datetime-local"
                name="endTime"
                className="input-field"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
