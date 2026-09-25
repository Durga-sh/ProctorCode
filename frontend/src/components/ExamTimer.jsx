import { useState, useEffect } from 'react';

export default function ExamTimer({ endTime, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setExpired(true);
        clearInterval(timer);
        if (onTimeUp) onTimeUp();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );

      setUrgent(diff < 5 * 60 * 1000); // < 5 minutes
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onTimeUp]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: expired ? 'var(--danger)' : urgent ? 'var(--warning)' : 'var(--success)',
        animation: urgent && !expired ? 'pulse-glow 1.5s infinite' : 'none',
        boxShadow: expired ? '0 0 8px var(--danger)' : urgent ? '0 0 8px var(--warning)' : 'none',
      }} />
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '1.1rem',
        fontWeight: 700,
        color: expired ? 'var(--danger)' : urgent ? 'var(--warning)' : 'var(--success)',
        letterSpacing: '0.05em',
      }}>
        {timeLeft}
      </span>
    </div>
  );
}
