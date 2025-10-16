import React, { useRef, useState } from "react";

export default function MessageInput({ onSend, onTyping, onAttachPdf }) {
  const [value, setValue] = useState("");
  const fileRef = useRef();

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      alert("Please attach a PDF file.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      alert("PDF too large (max 20MB).");
      return;
    }
    onAttachPdf(f);
    fileRef.current.value = "";
  };

  return (
    <div className="input-bar">
      <button
        className="attach-btn"
        title="Attach PDF"
        type="button"
        onClick={() => fileRef.current.click()}
      >📎</button>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="file-input"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <input
        className="text-input"
        placeholder="Ask anything..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
      />
      <button
        className="send-btn"
        type="button"
        onClick={handleSend}
      >Send</button>
    </div>
  );
}
