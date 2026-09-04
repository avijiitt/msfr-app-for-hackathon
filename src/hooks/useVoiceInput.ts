import { useState, useRef, useEffect, useCallback } from 'react';

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  onInterimResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  lang?: string; // Default: 'en-IN'
}

export function useVoiceInput({
  onResult,
  onInterimResult,
  onError,
  lang = 'en-IN',
}: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store callbacks in refs to avoid useEffect re-triggering and aborting recognition
  const onResultRef = useRef(onResult);
  const onInterimResultRef = useRef(onInterimResult);
  const onErrorRef = useRef(onError);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onInterimResultRef.current = onInterimResult;
  }, [onInterimResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true; // Stream interim results so user sees text as they speak
        recognition.maxAlternatives = 3;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0]?.transcript || '';
            if (result.isFinal) {
              finalTranscript += text;
            } else {
              interimTranscript += text;
            }
          }

          // Clean trailing punctuation like "." that browser automatically appends
          const cleanInterim = interimTranscript.trim().replace(/[.,;!?]+$/, '');
          const cleanFinal = finalTranscript.trim().replace(/[.,;!?]+$/, '');

          if (cleanInterim && onInterimResultRef.current) {
            onInterimResultRef.current(cleanInterim);
          }

          if (cleanFinal) {
            onResultRef.current(cleanFinal);
            setIsListening(false);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            const msg = 'Microphone access was denied. Please allow microphone in browser address bar.';
            setErrorMessage(msg);
            onErrorRef.current?.(msg);
          } else if (event.error !== 'no-speech') {
            setErrorMessage(event.error);
            onErrorRef.current?.(event.error);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Failed to initialize SpeechRecognition:', e);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [lang]); // Only recreate when lang explicitly changes, NOT on every parent re-render!

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Voice search is not supported in this browser. Please use Chrome, Edge, or mobile Chrome.');
        return;
      }
    }
    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
      }
    } catch (err: any) {
      // If already started, ignore or restart
      if (err.name !== 'InvalidStateError') {
        console.warn('Error starting speech recognition:', err);
      }
    }
  }, [lang]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Error stopping speech recognition:', err);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}
