import React from "react";

export default function PdfPreview({ file, onRemove }) {
  if (!file) return null;
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);

  return (
    <div className="pdf-info-bar">
      <span className="pdf-icon">📎</span>
      <span className="pdf-name" title={file.name}>{file.name}</span>
      <span className="pdf-size">{fileSizeMB} MB</span>
      <button className="remove-btn" onClick={onRemove}>Remove</button>
    </div>
  );
}
