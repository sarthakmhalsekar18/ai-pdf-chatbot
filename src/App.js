import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import PdfPreview from "./components/PdfPreview";
import { generateChat } from "./lib/gemini";
import { extractPdfText } from "./lib/pdfExtract";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Attach a PDF or ask a question." }
  ]);
  const [aiThinking, setAiThinking] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [attachedPdf, setAttachedPdf] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const controllerRef = useRef(null);

  // Smooth scroll to bottom on new messages or thinking toggles
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiThinking]);

  const startAbortController = () => {
    controllerRef.current?.abort();
    const ctrl = new window.AbortController();
    controllerRef.current = ctrl;
    return ctrl.signal;
  };

  const onAttachPdf = useCallback(async (file) => {
    setAttachedPdf(file);
    const text = await extractPdfText(file);
    setPdfText(text);
  }, []);

  const removePdf = useCallback(() => {
    setAttachedPdf(null);
    setPdfText("");
  }, []);

  const onTyping = useCallback((state) => setUserTyping(state), []);

  const onSend = useCallback(async (question) => {
    let prompt = question;
    if (pdfText) {
      prompt =
        `Here is a document:\n${pdfText}\n\n` +
        `Question: ${question}\n` +
        `Answer in plain text only. Do not use Markdown, asterisks, bold, lists, or code blocks. ` +
        `Return a single coherent paragraph without any special formatting.`;
    } else {
      prompt =
        `${question}\n` +
        `Answer in plain text only. Do not use Markdown, asterisks, bold, lists, or code blocks. ` +
        `Return a single coherent paragraph without any special formatting.`;
    }

    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setAiThinking(true);

    const signal = startAbortController();
    let acc = "";
    // placeholder AI message for streaming updates
    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    const onChunk = (t) => {
      acc += t;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "ai", text: acc };
        return copy;
      });
    };

    try {
      await generateChat({ prompt, signal, onChunk });
    } catch (e) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "ai", text: "Request cancelled or failed." };
        return copy;
      });
    } finally {
      setAiThinking(false);
      // Keep attachedPdf and pdfText to allow multiple questions about the same PDF
    }
  }, [pdfText]);

  const headerTitle = useMemo(() => "AI Chatbot", []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">{headerTitle}</div>
      </header>

      <main className="app-main">
        <div className="chat-window">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
          {/* If your ChatWindow component handles messages, you can swap the block above with <ChatWindow ... /> */}
          {aiThinking && (
            <div className="bubble ai">
              <div className="ai-thinking">
                <div className="ai-dot"></div>
                <div className="ai-dot"></div>
                <div className="ai-dot"></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="app-footer">
        {attachedPdf && (
          <div className="attach-row">
            <div className="attach-chip">
              <span className="attach-icon">📎</span>
              <span className="attach-name" title={attachedPdf.name}>{attachedPdf.name}</span>
              <span className="attach-size">
                {(attachedPdf.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button className="attach-remove" onClick={removePdf}>
                Remove
              </button>
            </div>
          </div>
        )}

        <MessageInput
          onSend={onSend}
          onTyping={onTyping}
          onAttachPdf={onAttachPdf}
        />
      </footer>
    </div>
  );
}

export default App;
