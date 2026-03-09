import { useState, useRef, useCallback } from 'react';

export default function useAudioRecorder(maxDuration = 60) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const startTime = useRef(null);
  const timerInterval = useRef(null);
  const streamRef = useRef(null);

  const supported = typeof navigator !== 'undefined' &&
    navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';

  const getMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = useCallback(async () => {
    if (!supported || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.current = recorder;
      startTime.current = Date.now();
      setAudioDuration(0);
      setAudioBlob(null);
      setAudioUrl(null);

      timerInterval.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
        setAudioDuration(elapsed);
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 500);

      recorder.start(250); // collect data every 250ms
      setIsRecording(true);
    } catch (err) {
      console.error('Audio recording error:', err);
    }
  }, [supported, isRecording, maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    const elapsed = startTime.current ? Math.floor((Date.now() - startTime.current) / 1000) : 0;
    setAudioDuration(elapsed);
    setIsRecording(false);
  }, []);

  const resetRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
    chunks.current = [];
  }, [audioUrl]);

  // Convert blob to base64 for Firestore storage
  const toBase64 = useCallback(() => {
    if (!audioBlob) return Promise.resolve(null);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(audioBlob);
    });
  }, [audioBlob]);

  return {
    isRecording,
    audioBlob,
    audioDuration,
    audioUrl,
    supported,
    mimeType: getMimeType(),
    startRecording,
    stopRecording,
    resetRecording,
    toBase64,
  };
}
