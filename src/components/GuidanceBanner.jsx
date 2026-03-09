import { useState } from 'react';
import { FIRST_WEEK_TIPS } from '../constants.js';

export default function GuidanceBanner({ daysSinceOnboarding, setScreen }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(`guidance_dismissed_${daysSinceOnboarding}`) === '1'; } catch { return false; }
  });

  if (dismissed) return null;
  if (daysSinceOnboarding < 0 || daysSinceOnboarding > 6) return null;

  const tip = FIRST_WEEK_TIPS[daysSinceOnboarding];
  if (!tip) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(`guidance_dismissed_${daysSinceOnboarding}`, '1'); } catch {}
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
      border: '1px solid #a78bfa',
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      position: 'relative',
    }}>
      <button onClick={handleDismiss}
        style={{
          position: 'absolute', top: 8, left: 8,
          background: 'none', border: 'none', color: '#7c3aed', fontSize: 14, cursor: 'pointer',
        }}>✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {tip.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#6d28d9', fontWeight: 700, marginBottom: 2 }}>
            💡 יום {daysSinceOnboarding + 1} מתוך 7
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', lineHeight: 1.4 }}>
            {tip.text}
          </div>
        </div>
      </div>

      <button onClick={() => setScreen('counselor')}
        style={{
          width: '100%', marginTop: 10, padding: '8px 12px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid #6366f140',
          borderRadius: 10, color: '#6366f1',
          fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}>
        💡 שאלו את מיכאל לעצות נוספות
      </button>
    </div>
  );
}
