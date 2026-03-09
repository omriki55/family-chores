import { useState, useRef, useCallback } from 'react';
import { getLang } from '../i18n/index.js';

export default function useVoiceInput() {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const cbRef = useRef(null);

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback((onResult) => {
    if (!supported || recRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = getLang() === 'he' ? 'he-IL' : 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    cbRef.current = onResult;

    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      const isFinal = e.results[e.results.length - 1].isFinal;
      if (cbRef.current) cbRef.current(transcript, isFinal);
    };
    rec.onerror = () => { setListening(false); recRef.current = null; };
    rec.onend = () => { setListening(false); recRef.current = null; };

    recRef.current = rec;
    rec.start();
  }, [supported]);

  const stop = useCallback(() => {
    if (recRef.current) { recRef.current.stop(); recRef.current = null; }
  }, []);

  const toggle = useCallback((onResult) => {
    if (recRef.current) stop(); else start(onResult);
  }, [start, stop]);

  return { listening, supported, toggle, start, stop };
}
