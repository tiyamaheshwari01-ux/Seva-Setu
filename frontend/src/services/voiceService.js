/**
 * SevaSetu – Voice Service
 *
 * Wraps the browser's Web Speech API for:
 *   - Speech-to-Text  (SpeechRecognition)
 *   - Text-to-Speech  (SpeechSynthesis)
 *
 * Chrome / Edge: Full support
 * Firefox: Requires "media.webspeech.recognition.enable" flag
 * Safari: Partial support (SpeechSynthesis works, recognition needs webkit prefix)
 *
 * To replace with a cloud STT/TTS API later, update startListening() and speak().
 */

// ─── Feature Detection ─────────────────────────────────────────────────────────

const SpeechRecognitionClass =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

const synthesisSupported = "speechSynthesis" in window;

let recognitionInstance = null;

/**
 * Check if both STT and TTS are supported in this browser.
 * @returns {{ stt: boolean, tts: boolean, fullySupported: boolean }}
 */
export function isVoiceSupported() {
  return {
    stt: Boolean(SpeechRecognitionClass),
    tts: synthesisSupported,
    fullySupported: Boolean(SpeechRecognitionClass) && synthesisSupported,
  };
}

// ─── Speech-to-Text ────────────────────────────────────────────────────────────

/**
 * Start listening for speech input.
 * @param {function} onResult  - Called with the recognized text string
 * @param {function} onError   - Called with an error message string
 * @param {function} onStart   - Called when listening starts (optional)
 * @param {function} onEnd     - Called when recognition ends (optional)
 */
export function startListening(onResult, onError, onStart, onEnd) {
  if (!SpeechRecognitionClass) {
    onError?.("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    return;
  }

  // Stop any existing session
  stopListening();

  const recognition = new SpeechRecognitionClass();
  recognition.lang = "en-IN"; // Indian English
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
    if (transcript) {
      onResult(transcript);
    } else {
      onError?.("Could not understand the audio. Please try again.");
    }
  };

  recognition.onerror = (event) => {
    const errorMessages = {
      "no-speech": "No speech detected. Please try again.",
      "audio-capture": "Microphone not found. Please check your microphone.",
      "not-allowed": "Microphone permission denied. Please allow microphone access and try again.",
      "network": "Network error during speech recognition.",
      "aborted": "Listening stopped.",
    };
    onError?.(errorMessages[event.error] || `Speech recognition error: ${event.error}`);
  };

  recognition.onend = () => {
    recognitionInstance = null;
    onEnd?.();
  };

  recognitionInstance = recognition;
  recognition.start();
}

/**
 * Stop the current listening session (if any).
 */
export function stopListening() {
  if (recognitionInstance) {
    try {
      recognitionInstance.abort();
    } catch (_) {
      // Ignore errors from aborting
    }
    recognitionInstance = null;
  }
}

// ─── Text-to-Speech ────────────────────────────────────────────────────────────

/**
 * Speak text aloud using the browser's SpeechSynthesis API.
 * @param {string}   text    - The text to speak
 * @param {function} onStart - Called when speaking starts (optional)
 * @param {function} onEnd   - Called when speaking ends (optional)
 */
export function speak(text, onStart, onEnd) {
  if (!synthesisSupported) {
    onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 0.95;  // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Prefer a female or neutral voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.lang === "en-IN") ||
    voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech synthesis.
 */
export function stopSpeaking() {
  if (synthesisSupported) {
    window.speechSynthesis.cancel();
  }
}
