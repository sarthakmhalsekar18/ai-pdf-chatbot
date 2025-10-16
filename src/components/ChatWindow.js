import React, { useEffect, useRef } from "react";

function AiThinkingIndicator() {
  return (
    <div className="ai-thinking">
      <div className="ai-dot"></div>
      <div className="ai-dot"></div>
      <div className="ai-dot"></div>
    </div>
  );
}

export default function ChatWindow({ messages, aiThinking }) {
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiThinking]);

  return (
    <div className="chat-window">
      {messages.map((m, i) => (
        <div key={i} className={`bubble ${m.role}`}>
          {m.text}
        </div>
      ))}
      {aiThinking && (
        <div className="bubble ai">
          <AiThinkingIndicator />
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
