import React, { useState, useEffect, useRef } from "react";

interface CreateEmailDialogProps {
  onCancel: () => void;
  onCreate: (pmId: string) => void;
}

const CreateEmailDialog: React.FC<CreateEmailDialogProps> = ({ onCancel, onCreate }) => {
  const [pmId, setPmId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when dialog mounts
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  // Allow only filename-safe chars: alphanumeric, hyphen, underscore, dot
  const safeId = pmId.replace(/[^a-zA-Z0-9\-_.]/g, "");
  const isValid = safeId.trim().length > 0;

  const handleCreate = () => {
    if (!isValid || isCreating) return;
    setIsCreating(true);
    const cleanId = safeId.trim();

    // 1. Invoke native Zig C backend to create physical folder on disk (projects/<PMID>/index.html + assets/)
    if (typeof (window as any).create_email_project === "function") {
      try {
        (window as any).create_email_project(cleanId);
      } catch (err) {
        console.warn("[CreateEmailDialog] Native create_email_project error:", err);
      }
    }

    onCreate(cleanId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") onCancel();
  };

  return (
    /* Full-screen backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "cgFadeIn 0.18s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <style>{`
        @keyframes cgFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cgSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        .cg-dialog-card {
          animation: cgSlideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cg-create-btn {
          transition: background 0.2s, box-shadow 0.2s, transform 0.12s;
        }
        .cg-create-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45) !important;
          transform: translateY(-1px);
        }
        .cg-create-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .cg-cancel-btn {
          transition: background 0.15s, color 0.15s;
        }
        .cg-cancel-btn:hover {
          background: rgba(0,0,0,0.07) !important;
        }
        .cg-pm-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18) !important;
        }
      `}</style>

      {/* Dialog card */}
      <div
        className="cg-dialog-card"
        style={{
          background: "linear-gradient(145deg, #1e293b, #0f172a)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          padding: "32px 36px 28px",
          width: "min(90vw, 440px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          color: "#f1f5f9",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", flexShrink: 0,
            boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
          }}>
            📁
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Create New Email Project
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              Creates a folder with index.html + assets/
            </div>
          </div>
        </div>

        {/* PM ID Input */}
        <label style={{
          display: "block", fontSize: "10px", fontWeight: 700,
          color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: "6px",
        }}>
          PM ID
        </label>
        <input
          ref={inputRef}
          className="cg-pm-input"
          type="text"
          value={pmId}
          onChange={(e) => setPmId(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. GSK-2024-001"
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: "10px",
            border: "1.5px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "#f1f5f9",
            fontSize: "14px",
            fontWeight: 600,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s, box-shadow 0.2s",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            letterSpacing: "0.02em",
          }}
        />

        {/* Live path preview */}
        <div style={{
          marginTop: "10px",
          padding: "9px 12px",
          borderRadius: "8px",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Project will be created at:
          </span>
          <div style={{
            marginTop: "4px",
            fontSize: "11px",
            color: safeId ? "#7dd3fc" : "#475569",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordBreak: "break-all",
            transition: "color 0.2s",
          }}>
            {safeId
              ? <><span style={{ color: "#64748b" }}>…/projects/</span><span style={{ color: "#7dd3fc", fontWeight: 700 }}>{safeId}</span><span style={{ color: "#64748b" }}>/</span></>
              : <span style={{ color: "#334155", fontStyle: "italic" }}>…/projects/</span>
            }
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "24px",
        }}>
          <button
            className="cg-cancel-btn"
            onClick={onCancel}
            disabled={isCreating}
            style={{
              padding: "9px 18px",
              borderRadius: "9px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#94a3b8",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isCreating ? "not-allowed" : "pointer",
              opacity: isCreating ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>

          <button
            className="cg-create-btn"
            onClick={handleCreate}
            disabled={!isValid || isCreating}
            style={{
              padding: "9px 20px",
              borderRadius: "9px",
              border: "none",
              background: isValid
                ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                : "rgba(255,255,255,0.06)",
              color: isValid ? "#fff" : "#475569",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isValid && !isCreating ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontFamily: "inherit",
              boxShadow: isValid ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
            }}
          >
            {isCreating ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Creating…
              </>
            ) : (
              <>✅ Create Project</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEmailDialog;
