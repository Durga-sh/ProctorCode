import React from 'react';

/* ─────────────────────────────────────────────────────────
   ProctoringOverlay
   Two modes:
   1. "gate"    — shown before exam starts, asks user to enter fullscreen
   2. "warning" — shown on violation, shows warning + remaining strikes
   ───────────────────────────────────────────────────────── */

export function FullscreenGate({ examTitle, onEnter }) {
  return (
    <div className="proctor-gate">
      <div className="proctor-gate-card animate-slide-up">
        {/* Icon */}
        <div className="proctor-gate-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="proctor-gate-title">Fullscreen Required</h1>
        <p className="proctor-gate-subtitle">
          <strong>{examTitle}</strong>
        </p>

        <div className="proctor-rules">
          <div className="proctor-rule">
            <span className="proctor-rule-icon">🖥️</span>
            <span>Exam must be taken in fullscreen mode</span>
          </div>
          <div className="proctor-rule">
            <span className="proctor-rule-icon">🚫</span>
            <span>Tab switching is strictly prohibited</span>
          </div>
          <div className="proctor-rule">
            <span className="proctor-rule-icon">⚠️</span>
            <span>3 violations will auto-submit your exam</span>
          </div>
          <div className="proctor-rule">
            <span className="proctor-rule-icon">🔒</span>
            <span>Right-click and DevTools are disabled</span>
          </div>
        </div>

        <button className="proctor-enter-btn" onClick={onEnter}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Enter Fullscreen &amp; Start Exam
        </button>

        <p className="proctor-gate-note">
          By clicking above you agree to the exam integrity rules.
        </p>
      </div>
    </div>
  );
}


export function ViolationWarning({ message, violations, maxViolations, onDismiss, autoSubmitting }) {
  const remaining = maxViolations - violations;
  const isFinal = remaining <= 0;

  return (
    <div className="proctor-overlay">
      <div className={`proctor-warning-card animate-slide-up ${isFinal ? 'proctor-warning-final' : ''}`}>
        {/* Pulse ring */}
        <div className="proctor-warning-pulse" />

        {/* Icon */}
        <div className={`proctor-warning-icon ${isFinal ? 'icon-danger' : 'icon-warn'}`}>
          {isFinal ? '🚨' : '⚠️'}
        </div>

        <h2 className="proctor-warning-title">
          {isFinal ? 'Exam Auto-Submitting' : 'Integrity Violation'}
        </h2>

        <p className="proctor-warning-message">{message}</p>

        {/* Strike indicator */}
        <div className="proctor-strikes">
          {Array.from({ length: maxViolations }).map((_, i) => (
            <div
              key={i}
              className={`proctor-strike-dot ${i < violations ? (isFinal ? 'strike-final' : 'strike-active') : 'strike-empty'}`}
            />
          ))}
        </div>

        <p className="proctor-strikes-label">
          {isFinal
            ? 'Maximum violations reached. Your exam is being submitted...'
            : `${remaining} warning${remaining !== 1 ? 's' : ''} remaining before auto-submit`}
        </p>

        {!isFinal && (
          <button className="proctor-dismiss-btn" onClick={onDismiss}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Return to Fullscreen
          </button>
        )}
      </div>
    </div>
  );
}
