import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('visionary_voice_enabled');
    return saved !== 'false';
  });
  const [isSupported, setIsSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setVoicesLoaded(true);
        }
      };

      // Try loading immediately
      loadVoices();

      // Also listen for voiceschanged event (for Chrome/Edge)
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text: string, language: string = 'es-ES') => {
    if (!isSupported || !isEnabled || !voicesLoaded) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Detect language: if text contains mostly English words, use en-US, otherwise es-ES
    const englishPattern = /^[a-zA-Z0-9\s\.,;:!?'"()\-]+$/;
    const hasEnglishWords = /\b(the|is|are|and|or|to|from|with|for|of|in|on|at|this|that|have|will|can|should)\b/i.test(text);
    const detectedLang = (englishPattern.test(text.substring(0, 100)) && hasEnglishWords) ? 'en-US' : 'es-ES';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectedLang;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Select voice based on detected language - prioritize natural female voices
    let selectedVoice;
    if (detectedLang === 'en-US') {
      // English: prefer Google or Microsoft natural female voices
      selectedVoice = voices.find(v => 
        v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Microsoft')) && 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('aria'))
      ) || voices.find(v => 
        v.lang === 'en-US' && v.name.toLowerCase().includes('female')
      ) || voices.find(v => 
        v.lang === 'en-US' && !v.name.toLowerCase().includes('male')
      ) || voices.find(v => 
        v.lang.startsWith('en-') && !v.name.toLowerCase().includes('male')
      );
    } else {
      // Spanish (Spain): Priority order for natural Spain Spanish female voice
      selectedVoice = voices.find(v => 
        v.lang === 'es-ES' && v.name.includes('Google') && v.name.includes('español')
      ) || voices.find(v => 
        v.lang === 'es-ES' && v.name.toLowerCase().includes('helena')
      ) || voices.find(v => 
        v.lang === 'es-ES' && v.name.includes('Microsoft')
      ) || voices.find(v => 
        v.lang === 'es-ES' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('femenina'))
      ) || voices.find(v => 
        v.lang === 'es-ES' && !v.name.toLowerCase().includes('male')
      ) || voices.find(v => v.lang === 'es-ES');
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('🎙️ Voice selected:', selectedVoice.name, '| Language:', selectedVoice.lang, '| Detected:', detectedLang);
    } else {
      console.warn('⚠️ No suitable voice found for', detectedLang);
    }

    // Optimized for friendly, natural conversation
    utterance.pitch = 1.08; // Slightly higher for warmth and friendliness
    utterance.rate = 0.95; // Natural conversational speed
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleEnabled = () => {
    if (isEnabled && isSpeaking) {
      stop();
    }
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    localStorage.setItem('visionary_voice_enabled', String(newEnabled));
  };

  return {
    speak,
    stop,
    isSpeaking,
    isEnabled,
    isSupported,
    toggleEnabled,
  };
};
