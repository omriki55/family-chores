import { useState, useEffect, useRef } from 'react';
import { FAMILY } from '../../constants.js';
import { t } from '../../i18n/index.js';

export default function TimerModal({ S, app }) {
  const { activeTimer, setActiveTimer, setDoneConfirm, flash } = app;
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!activeTimer) { setElapsed(0); return; }
    const start = activeTimer.startTs;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [activeTimer]);

  if (!activeTimer) return null;

  const task = app.tasks.find(t => t.id === activeTimer.taskId);
  const child = FAMILY[activeTimer.childId];
  const limitSec = (activeTimer.timeLimit || 0) * 60;
  const isCountdown = limitSec > 0;
  const remaining = isCountdown ? Math.max(0, limitSec - elapsed) : elapsed;
  const pct = isCountdown ? Math.min(100, (elapsed / limitSec) * 100) : 0;
  const overTime = isCountdown && elapsed > limitSec;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  // Vibrate when timer ends
  useEffect(() => {
    if (isCountdown && elapsed === limitSec && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }, [elapsed, limitSec, isCountdown]);

  const handleComplete = () => {
    setDoneConfirm({ taskId: activeTimer.taskId, childId: activeTimer.childId, day: activeTimer.day, timerBonus: isCountdown && !overTime });
    setActiveTimer(null);
  };

  const handleCancel = () => {
    setActiveTimer(null);
    flash(t("timer.cancelled"));
  };

  // Circular progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div style={S.ov}>
      <div style={{ ...S.md, maxWidth: 320, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{t("timer.title")}</div>

        {/* Task info */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>{task?.icon || "📋"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{task?.title || t("timer.task")}</div>
            <div style={{ fontSize: 10, color: child?.color || "#6366f1" }}>{child?.name}</div>
          </div>
        </div>

        {/* Circular timer */}
        <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto 16px" }}>
          <svg width="150" height="150" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="75" cy="75" r={radius} fill="none" stroke="var(--barBg)" strokeWidth="8" />
            {isCountdown && (
              <circle cx="75" cy="75" r={radius} fill="none"
                stroke={overTime ? "#ef4444" : "#6366f1"} strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s" }} />
            )}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: overTime ? "#ef4444" : "var(--text)", fontFamily: "monospace" }}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            {isCountdown && <div style={{ fontSize: 10, color: overTime ? "#ef4444" : "#6366f1" }}>{overTime ? t("timer.overtime") : t("timer.remaining")}</div>}
            {!isCountdown && <div style={{ fontSize: 10, color: "#6366f1" }}>{t("timer.elapsed")}</div>}
          </div>
        </div>

        {/* Timer bonus hint */}
        {isCountdown && !overTime && (
          <div style={{ fontSize: 10, color: "#10b981", marginBottom: 10, fontWeight: 600 }}>
            {t("timer.bonusHint")}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCancel}
            style={{ flex: 1, padding: 12, background: "var(--barBg)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {t("timer.cancel")}
          </button>
          <button onClick={handleComplete}
            style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {t("timer.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
