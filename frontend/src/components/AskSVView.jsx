import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { answerQuery } from "../agents/businessAgent.js";
import { startListening, stopListening, speak, stopSpeaking, isVoiceSupported } from "../services/voiceService.js";

// Voice states
const VOICE_STATE = {
  IDLE: "idle",
  LISTENING: "listening",
  PROCESSING: "processing",
  SPEAKING: "speaking",
};

const QUICK_QUESTIONS = [
  "How much did I sell this year?",
  "Which month was my best?",
  "What were my total expenses?",
  "What's my estimated profit?",
  "What's my estimated tax?",
  "What if my sales increase by 20%?",
  "What if I give 10% discount this weekend?",
  "What if I give 20% discount on all items?",
];

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "sv",
  text: "Hi! I'm SV, your AI business teammate. I've analyzed your financial data and I'm ready to help.\n\nYou can ask me things like:\n• \"How much did I sell this year?\"\n• \"Which month was my best?\"\n• \"What's my estimated tax?\"\n• \"What if I give 10% discount this weekend?\"\n\nYou can also use the 🎙️ microphone to speak your question!",
  timestamp: new Date(),
};

// ── Scenario Simulation Card ────────────────────────────────────────────────
function ScenarioCard({ result }) {
  const riskColors = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };
  const riskBg     = { low: "rgba(34,197,94,0.1)", medium: "rgba(245,158,11,0.1)", high: "rgba(239,68,68,0.1)" };

  return (
    <div className="scenario-card">
      {/* Metric grid */}
      <div className="scenario-metrics">
        {result.metrics.map((m, i) => (
          <div key={i} className={`scenario-metric scenario-metric--${m.color}`}>
            <div className="sm-icon">{m.icon}</div>
            <div className="sm-body">
              <div className="sm-label">{m.label}</div>
              <div className="sm-range">
                {m.pctHigh
                  ? <strong>{m.pctLow} – {m.pctHigh}</strong>
                  : <strong>{m.pctLow || m.rangeLow}</strong>
                }
              </div>
              <div className="sm-sub">
                {m.pctHigh ? `${m.rangeLow} to ${m.rangeHigh}` : m.rangeHigh}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk */}
      <div
        className="scenario-risk"
        style={{ background: riskBg[result.riskLevel], borderColor: riskColors[result.riskLevel] }}
      >
        <span className="scenario-risk-label" style={{ color: riskColors[result.riskLevel] }}>
          {result.riskLevel === "low" ? "✅ Low Risk" : result.riskLevel === "medium" ? "⚠️ Moderate Risk" : "🔴 High Risk"}
        </span>
        <p>{result.riskText}</p>
      </div>

      {/* Recommendation */}
      <div className="scenario-recommendation">
        <span className="scenario-rec-label">🤖 AI Recommendation</span>
        <p>{result.recommendation}</p>
      </div>

      {/* Disclaimer */}
      <p className="scenario-disclaimer">
        ⚠️ Estimates only — {result.disclaimer}
      </p>
    </div>
  );
}

function AskSVView({ selectedYear }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceState, setVoiceState] = useState(VOICE_STATE.IDLE);
  const [voiceError, setVoiceError] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const voiceSupport = isVoiceSupported();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, []);

  const addMessage = (role, text, scenarioResult = null) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), role, text, scenarioResult, timestamp: new Date() },
    ]);
  };


  const processAndRespond = useCallback(
    async (query) => {
      if (!query.trim() || isProcessing) return;

      addMessage("user", query);
      setIsProcessing(true);

      // Simulate a brief thinking delay for AI feel
      await new Promise((r) => setTimeout(r, 500));

      const result = answerQuery(query, selectedYear);
      const responseText = result.text;
      const scenarioResult = result.scenarioResult || null;

      setIsProcessing(false);
      addMessage("sv", responseText, scenarioResult);

      return responseText;
    },
    [isProcessing, selectedYear]
  );

  // ── Text Submit ────────────────────────────────────────────────────────────
  const handleTextSubmit = async (e) => {
    e?.preventDefault();
    const query = inputText.trim();
    if (!query || isProcessing || voiceState !== VOICE_STATE.IDLE) return;
    setInputText("");
    await processAndRespond(query);
    inputRef.current?.focus();
  };

  // ── Voice Flow ─────────────────────────────────────────────────────────────
  const handleMicClick = () => {
    setVoiceError("");

    if (voiceState === VOICE_STATE.LISTENING) {
      stopListening();
      setVoiceState(VOICE_STATE.IDLE);
      setLiveTranscript("");
      return;
    }

    if (voiceState === VOICE_STATE.SPEAKING) {
      stopSpeaking();
      setVoiceState(VOICE_STATE.IDLE);
      return;
    }

    if (!voiceSupport.stt) {
      setVoiceError("Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your question.");
      return;
    }

    setVoiceState(VOICE_STATE.LISTENING);
    setLiveTranscript("");

    startListening(
      // onResult
      async (transcript) => {
        setLiveTranscript(transcript);
        setVoiceState(VOICE_STATE.PROCESSING);

        const responseText = await processAndRespond(transcript);
        setLiveTranscript("");

        if (responseText && voiceSupport.tts) {
          setVoiceState(VOICE_STATE.SPEAKING);
          speak(
            responseText,
            () => setVoiceState(VOICE_STATE.SPEAKING),
            () => setVoiceState(VOICE_STATE.IDLE)
          );
        } else {
          setVoiceState(VOICE_STATE.IDLE);
        }
      },
      // onError
      (err) => {
        setVoiceError(err);
        setVoiceState(VOICE_STATE.IDLE);
        setLiveTranscript("");
      },
      // onStart
      () => setVoiceState(VOICE_STATE.LISTENING),
      // onEnd (if recognition ends without result)
      () => {
        if (voiceState === VOICE_STATE.LISTENING) {
          setVoiceState(VOICE_STATE.IDLE);
          setLiveTranscript("");
        }
      }
    );
  };

  // ── Quick Question ─────────────────────────────────────────────────────────
  const handleQuickQuestion = async (q) => {
    if (isProcessing || voiceState !== VOICE_STATE.IDLE) return;
    await processAndRespond(q);
  };

  const voiceLabel = {
    [VOICE_STATE.IDLE]: "Ask SV",
    [VOICE_STATE.LISTENING]: "Listening…",
    [VOICE_STATE.PROCESSING]: "Analyzing…",
    [VOICE_STATE.SPEAKING]: "SV is speaking…",
  };

  const voiceIcon = {
    [VOICE_STATE.IDLE]: <Mic size={20} />,
    [VOICE_STATE.LISTENING]: <MicOff size={20} />,
    [VOICE_STATE.PROCESSING]: <Loader2 size={20} className="animate-spin" />,
    [VOICE_STATE.SPEAKING]: <Volume2 size={20} />,
  };

  return (
    <div className="ask-sv-view">
      {/* Header */}
      <div className="asksv-header">
        <div className="asksv-agent-info">
          <div className="asksv-avatar">SV</div>
          <div>
            <h2>Ask SV</h2>
            <p>Your AI business teammate — text or voice</p>
          </div>
        </div>
        <div className="asksv-year-badge">{selectedYear}</div>
      </div>

      {/* Voice Status Banner */}
      {voiceState !== VOICE_STATE.IDLE && (
        <div className={`asksv-voice-banner voice-${voiceState}`}>
          {voiceState === VOICE_STATE.LISTENING && (
            <div className="voice-listening-indicator">
              <span className="voice-pulse-ring"></span>
              <span className="voice-pulse-ring delay1"></span>
              <span className="voice-pulse-ring delay2"></span>
              <Mic size={18} />
            </div>
          )}
          {voiceState === VOICE_STATE.PROCESSING && <Loader2 size={18} className="animate-spin" />}
          {voiceState === VOICE_STATE.SPEAKING && <Volume2 size={18} />}
          <span className="voice-banner-label">{voiceLabel[voiceState]}</span>
          {liveTranscript && (
            <span className="voice-transcript-preview">"{liveTranscript}"</span>
          )}
        </div>
      )}

      {/* Voice Error */}
      {voiceError && (
        <div className="asksv-voice-error">
          ⚠️ {voiceError}
          <button onClick={() => setVoiceError("")}>✕</button>
        </div>
      )}

      {/* Chat Window */}
      <div className="asksv-chat-window">
        <div className="asksv-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`asksv-message ${msg.role === "user" ? "msg-user" : "msg-sv"}`}>
              {msg.role === "sv" && (
                <div className="msg-avatar-small">SV</div>
              )}
              <div className="msg-bubble">
                <div className="msg-text">
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {/* Scenario Simulation Card — rendered inline when the AI ran a simulation */}
                {msg.role === "sv" && msg.scenarioResult && (
                  <ScenarioCard result={msg.scenarioResult} />
                )}
                <div className="msg-time">
                  {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="asksv-message msg-sv">
              <div className="msg-avatar-small">SV</div>
              <div className="msg-bubble msg-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      <div className="asksv-quick-questions">
        <span className="quick-q-label">Quick questions:</span>
        <div className="quick-q-chips">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              className="quick-q-chip"
              onClick={() => handleQuickQuestion(q)}
              disabled={isProcessing || voiceState !== VOICE_STATE.IDLE}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Row */}
      <form className="asksv-input-row" onSubmit={handleTextSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="asksv-text-input"
          placeholder="Ask SV anything about your business…"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing || voiceState !== VOICE_STATE.IDLE}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleTextSubmit(e);
          }}
        />

        <button
          type="submit"
          className="asksv-send-btn"
          disabled={isProcessing || !inputText.trim() || voiceState !== VOICE_STATE.IDLE}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>

        {/* Microphone Button */}
        <button
          type="button"
          className={`asksv-mic-btn voice-state-${voiceState}`}
          onClick={handleMicClick}
          disabled={isProcessing}
          aria-label={voiceLabel[voiceState]}
          title={voiceLabel[voiceState]}
        >
          {voiceIcon[voiceState]}
          <span className="mic-btn-label">{voiceLabel[voiceState]}</span>
          {voiceState === VOICE_STATE.LISTENING && (
            <span className="mic-pulse-ring"></span>
          )}
        </button>
      </form>

      {/* Voice Support Notice */}
      {!voiceSupport.fullySupported && (
        <p className="asksv-voice-notice">
          🎙️ Voice assistant works best in Chrome or Edge. Text input is fully available.
        </p>
      )}
    </div>
  );
}

export default AskSVView;
