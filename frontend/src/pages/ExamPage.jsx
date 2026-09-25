import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import CodeEditor from '../components/CodeEditor';
import ProblemPanel from '../components/ProblemPanel';
import ExamTimer from '../components/ExamTimer';
import TestCaseResults from '../components/TestCaseResults';
import LanguageSelector from '../components/LanguageSelector';
import { FullscreenGate, ViolationWarning } from '../components/ProctoringOverlay';
import { useProctoring } from '../hooks/useProctoring';

const BOILERPLATE = {
  python: '# Write your Python solution here\n\ndef solve():\n    # Read input\n    n = int(input())\n    # Your code here\n    print(n)\n\nsolve()\n',
  java: '// Write your Java solution here\n\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Your code here\n        System.out.println(n);\n    }\n}\n',
  cpp: '// Write your C++ solution here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Your code here\n    cout << n << endl;\n    return 0;\n}\n',
};

export default function ExamPage() {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(BOILERPLATE.python);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Proctoring ──────────────────────────────────────────
  // examActive becomes true once the user clicks "Enter Fullscreen"
  const [examActive, setExamActive] = useState(false);

  // Track code per question per language
  const codeStore = useRef({});

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        API.get(`/exams/${examId}`),
        API.get(`/questions/${examId}`),
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);
      if (questionsRes.data.length > 0) {
        setSelectedQuestion(questionsRes.data[0]);
      }
    } catch (err) {
      setError('Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const selectQuestion = (question) => {
    // Save current code
    if (selectedQuestion) {
      const key = `${selectedQuestion.id}-${language}`;
      codeStore.current[key] = code;
    }
    setSelectedQuestion(question);
    setResults(null);

    // Restore saved code or use boilerplate
    const key = `${question.id}-${language}`;
    setCode(codeStore.current[key] || BOILERPLATE[language]);
  };

  const changeLanguage = (newLang) => {
    // Save current code
    if (selectedQuestion) {
      const key = `${selectedQuestion.id}-${language}`;
      codeStore.current[key] = code;
    }

    setLanguage(newLang);

    // Restore or use boilerplate for new language
    if (selectedQuestion) {
      const key = `${selectedQuestion.id}-${newLang}`;
      setCode(codeStore.current[key] || BOILERPLATE[newLang]);
    } else {
      setCode(BOILERPLATE[newLang]);
    }
  };

  const runCode = async () => {
    if (!selectedQuestion) return;
    setRunning(true);
    setResults(null);
    setError('');

    try {
      const res = await API.post('/submissions/run', {
        questionId: selectedQuestion.id,
        code,
        language,
        type: 'run',
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  const submitCode = async () => {
    if (!selectedQuestion) return;
    setSubmitting(true);
    setResults(null);
    setError('');

    try {
      const res = await API.post('/submissions/submit', {
        questionId: selectedQuestion.id,
        code,
        language,
        type: 'submit',
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    // Auto-submit on time up
    if (selectedQuestion && code) {
      submitCode();
    }
    setTimeout(() => {
      navigate(`/results/${examId}`);
    }, 3000);
  }, [selectedQuestion, code, examId]);

  // ── Proctoring hook ─────────────────────────────────────
  const handleForceSubmit = useCallback(() => {
    // Called when violations hit max — submit then redirect
    if (selectedQuestion && code) {
      submitCode();
    }
    setTimeout(() => {
      navigate(`/results/${examId}`);
    }, 4000);
  }, [selectedQuestion, code, examId]);

  const {
    violations,
    maxViolations,
    warningVisible,
    warningMessage,
    dismissWarning,
    enterFullscreen,
  } = useProctoring(examActive, handleForceSubmit);

  const handleEnterFullscreen = useCallback(() => {
    setExamActive(true);
    enterFullscreen();
  }, [enterFullscreen]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Exam not found</div>
      </div>
    );
  }

  return (
    <>
      {/* ── Fullscreen gate (shown before exam starts) ── */}
      {!examActive && (
        <FullscreenGate examTitle={exam.title} onEnter={handleEnterFullscreen} />
      )}

      {/* ── Violation warning modal ── */}
      {warningVisible && (
        <ViolationWarning
          message={warningMessage}
          violations={violations}
          maxViolations={maxViolations}
          onDismiss={dismissWarning}
        />
      )}

    <div className="exam-layout">
      {/* Sidebar — Question List */}
      <div className="exam-sidebar">
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{exam.title}</h3>
          <ExamTimer endTime={exam.endTime} onTimeUp={handleTimeUp} />

          {/* Violation counter badge */}
          {examActive && violations > 0 && (
            <div className="proctor-violation-badge">
              <span>⚠️</span>
              <span>{violations}/{maxViolations} violations</span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => selectQuestion(q)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: selectedQuestion?.id === q.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: 'none',
                borderLeft: selectedQuestion?.id === q.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                color: selectedQuestion?.id === q.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{
                width: '28px', height: '28px',
                borderRadius: '8px',
                background: selectedQuestion?.id === q.id ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
                color: selectedQuestion?.id === q.id ? 'white' : 'var(--text-muted)',
              }}>
                {index + 1}
              </span>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{q.title}</div>
                <span className={`badge badge-${q.difficulty.toLowerCase()}`} style={{ marginTop: '4px', fontSize: '0.65rem', padding: '1px 8px' }}>
                  {q.difficulty}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <button onClick={() => navigate(`/results/${examId}`)} className="btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>
            View Results
          </button>
        </div>
      </div>

      {/* Problem Panel */}
      <ProblemPanel question={selectedQuestion} />

      {/* Editor Panel */}
      <div className="editor-panel">
        {/* Editor Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}>
          <LanguageSelector language={language} onChange={changeLanguage} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={runCode} className="btn-secondary" disabled={running || submitting}
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              {running ? '⟳ Running...' : '▶ Run'}
            </button>
            <button onClick={submitCode} className="btn-success" disabled={running || submitting}
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              {submitting ? '⟳ Submitting...' : '✓ Submit'}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
          />
        </div>

        {/* Results Panel */}
        {(results || error) && (
          <div style={{
            borderTop: '1px solid var(--border)',
            maxHeight: '35%',
            overflow: 'auto',
            background: 'var(--bg-secondary)',
          }}>
            {error && <div className="alert alert-error" style={{ margin: '12px' }}>{error}</div>}
            {results && <TestCaseResults results={results} />}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
