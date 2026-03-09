import { useState, useRef } from 'react';
import { FAMILY, CH } from '../../constants.js';
import useAudioRecorder from '../../hooks/useAudioRecorder.js';

export default function VoiceMessagesScreen({ S, app }) {
  const { user, isP, messages, sendVoiceMessage, flash } = app;
  const [recipient, setRecipient] = useState('all');
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  const {
    isRecording, audioBlob, audioDuration, audioUrl,
    supported, mimeType,
    startRecording, stopRecording, resetRecording, toBase64,
  } = useAudioRecorder(60);

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    const base64 = await toBase64();
    if (!base64) return;
    await sendVoiceMessage(base64, recipient, audioDuration, mimeType);
    resetRecording();
  };

  const voiceMessages = messages
    .filter(m => m.type === 'voice' && (
      m.to === 'all' || m.to === user || m.from === user
    ))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 50);

  const unlistened = voiceMessages.filter(m => m.from !== user && !m.listened).length;

  const playMessage = (msg) => {
    if (playing === msg.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(msg.audioData);
    audio.onended = () => setPlaying(null);
    audio.onerror = () => { setPlaying(null); flash('⚠️ שגיאה בנגינת ההודעה'); };
    audioRef.current = audio;
    audio.play();
    setPlaying(msg.id);
    // Mark as listened
    if (msg.from !== user && !msg.listened && app.markVoiceListened) {
      app.markVoiceListened(msg.id);
    }
  };

  // Recipient options
  const recipientOptions = isP
    ? [{ id: 'all', label: '👨‍👩‍👧‍👦 כולם' }, ...CH.map(c => ({ id: c, label: `${FAMILY[c]?.emoji} ${FAMILY[c]?.name}` }))]
    : [{ id: 'all', label: '👨‍👩‍👧‍👦 להורים' }];

  return (
    <>
      <h2 style={S.st}>🎙️ הודעות קוליות</h2>

      {!supported && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: 12, marginBottom: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#dc2626', fontWeight: 700 }}>❌ הדפדפן לא תומך בהקלטה</div>
          <div style={{ fontSize: 10, color: '#ef4444' }}>נסו דפדפן Chrome עדכני</div>
        </div>
      )}

      {/* Recorder section */}
      {supported && (
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 16, marginBottom: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
          {/* Recipient selector */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            {recipientOptions.map(r => (
              <button key={r.id} onClick={() => setRecipient(r.id)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: recipient === r.id ? '#6366f1' : 'var(--inputBg)',
                  color: recipient === r.id ? '#fff' : 'var(--textSec)',
                  border: `1px solid ${recipient === r.id ? '#6366f1' : 'var(--border)'}`,
                }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Record button */}
          {!audioBlob && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  width: 72, height: 72, borderRadius: 36,
                  background: isRecording ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: '#fff',
                  boxShadow: isRecording ? '0 0 0 8px rgba(239,68,68,0.2)' : '0 4px 15px rgba(99,102,241,0.3)',
                  animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  transition: 'all 0.3s',
                }}>
                {isRecording ? '⏹' : '🎙️'}
              </button>
              {isRecording ? (
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>
                  {formatDuration(audioDuration)}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--textSec)' }}>לחצו להקלטה (עד 60 שניות)</div>
              )}
            </div>
          )}

          {/* Preview & send */}
          {audioBlob && !isRecording && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>🎙️</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{formatDuration(audioDuration)}</span>
                <audio src={audioUrl} controls style={{ height: 32, maxWidth: 180 }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSend}
                  style={{
                    padding: '8px 24px', background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>
                  📤 שלח
                </button>
                <button onClick={resetRecording}
                  style={{
                    padding: '8px 16px', background: 'var(--inputBg)',
                    border: '1px solid var(--border)', borderRadius: 10, color: 'var(--textSec)', fontSize: 12, cursor: 'pointer',
                  }}>
                  🗑️ בטל
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages feed */}
      {unlistened > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b40', borderRadius: 10, padding: '6px 12px', marginBottom: 10, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>🔔 {unlistened} הודעות חדשות</span>
        </div>
      )}

      {voiceMessages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 40 }}>🎙️</div>
          <div style={{ fontSize: 12, color: 'var(--textSec)', marginTop: 8 }}>עדיין אין הודעות קוליות</div>
          <div style={{ fontSize: 10, color: 'var(--textTer)', marginTop: 4 }}>הקליטו הודעה ראשונה!</div>
        </div>
      ) : (
        voiceMessages.map(msg => {
          const isMine = msg.from === user;
          const fromName = msg.from === 'system' ? '🤖' : (FAMILY[msg.from]?.name || msg.from);
          const fromEmoji = FAMILY[msg.from]?.emoji || '👤';
          const fromColor = FAMILY[msg.from]?.color || '#6366f1';
          const isPlaying = playing === msg.id;
          const isNew = !isMine && !msg.listened;
          const timeStr = new Date(msg.ts).toLocaleString('he-IL', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' });

          return (
            <div key={msg.id}
              style={{
                background: isNew ? 'linear-gradient(135deg, #fef3c7, #fffbeb)' : 'var(--card)',
                borderRadius: 12, padding: 12, marginBottom: 6,
                border: `1px solid ${isNew ? '#f59e0b40' : 'var(--border)'}`,
                opacity: isMine ? 0.85 : 1,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => playMessage(msg)}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : `linear-gradient(135deg, ${fromColor}, ${fromColor}cc)`,
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: '#fff',
                    boxShadow: isPlaying ? '0 0 0 4px rgba(239,68,68,0.2)' : 'none',
                  }}>
                  {isPlaying ? '⏸' : '▶️'}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: fromColor }}>{fromEmoji} {fromName}</span>
                    {isNew && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#f59e0b', display: 'inline-block' }} />}
                    {msg.to !== 'all' && <span style={{ fontSize: 9, color: 'var(--textTer)' }}>← {FAMILY[msg.to]?.name || 'כולם'}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {/* Audio waveform placeholder */}
                    <div style={{ flex: 1, height: 4, background: 'var(--barBg)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: isPlaying ? '60%' : '100%',
                        background: isPlaying ? '#ef4444' : fromColor + '60',
                        borderRadius: 2, transition: 'width 0.3s',
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--textTer)', fontWeight: 600 }}>{formatDuration(msg.duration || 0)}</span>
                  </div>
                </div>
                <span style={{ fontSize: 9, color: 'var(--textTer)' }}>{timeStr}</span>
              </div>
            </div>
          );
        })
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
      `}</style>
    </>
  );
}
