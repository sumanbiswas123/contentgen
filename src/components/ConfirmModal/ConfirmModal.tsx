import React, { useEffect } from "react";
import ReactDOM from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Yes, Erase",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  // 1. Inject the Modal Card inside the child canvas WebView
  useEffect(() => {
    const evalInCanvas = (js: string) => {
      if (typeof (window as any).eval_child_js === "function") {
        (window as any).eval_child_js(js);
      }
    };

    if (isOpen) {
      try {
        const channel = new BroadcastChannel("editor_channel");
        channel.postMessage({ type: "open-confirm-modal" });
        channel.close();
      } catch (e) {}

      evalInCanvas(`
        (function() {
          if (document.getElementById('__agy_modal_overlay')) return;

          // ── Inject CSS Styles inside Child Canvas WebView ──────
          var style = document.createElement('style');
          style.id = '__agy_modal_style';
          style.textContent = \`
            @keyframes __agy_fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes __agy_slide { from { opacity: 0; transform: translateY(18px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

            .__agy_backdrop {
              position: fixed !important;
              top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
              width: 100vw !important; height: 100vh !important;
              z-index: 999999 !important;
              background: rgba(0, 0, 0, 0.65) !important;
              backdrop-filter: blur(8px) !important;
              -webkit-backdrop-filter: blur(8px) !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              animation: __agy_fade 0.18s ease !important;
              box-sizing: border-box !important;
              margin: 0 !important; padding: 0 !important;
            }

            .__agy_card {
              background: #181824 !important;
              border: 1px solid rgba(255, 255, 255, 0.12) !important;
              border-radius: 18px !important;
              box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
              padding: 24px 26px 20px !important;
              width: 390px !important;
              max-width: calc(100vw - 40px) !important;
              box-sizing: border-box !important;
              animation: __agy_slide 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              display: flex !important;
              flex-direction: column !important;
            }

            .__agy_header {
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;
              margin-bottom: 14px !important;
            }

            .__agy_icon_wrap {
              width: 40px !important;
              height: 40px !important;
              border-radius: 12px !important;
              background: rgba(239, 68, 68, 0.15) !important;
              border: 1px solid rgba(239, 68, 68, 0.25) !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              flex-shrink: 0 !important;
            }

            .__agy_title {
              margin: 0 !important;
              font-size: 16px !important;
              font-weight: 700 !important;
              color: #f8fafc !important;
              letter-spacing: -0.01em !important;
              line-height: 1.3 !important;
            }

            .__agy_msg {
              margin: 0 0 20px 0 !important;
              font-size: 13.5px !important;
              color: #94a3b8 !important;
              line-height: 1.6 !important;
            }

            .__agy_divider {
              height: 1px !important;
              background: rgba(255, 255, 255, 0.08) !important;
              margin: 0 0 16px 0 !important;
              width: 100% !important;
            }

            .__agy_btn_row {
              display: flex !important;
              gap: 10px !important;
              justify-content: flex-end !important;
              align-items: center !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .__agy_btn {
              padding: 9px 20px !important;
              border-radius: 10px !important;
              font-size: 13px !important;
              font-weight: 600 !important;
              cursor: pointer !important;
              border: none !important;
              transition: all 0.15s ease !important;
              outline: none !important;
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
            }

            .__agy_btn_cancel {
              background: rgba(255, 255, 255, 0.08) !important;
              color: #cbd5e1 !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            .__agy_btn_cancel:hover {
              background: rgba(255, 255, 255, 0.14) !important;
              color: #ffffff !important;
            }

            .__agy_btn_confirm {
              background: linear-gradient(135deg, #ef4444, #dc2626) !important;
              color: #ffffff !important;
              box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4) !important;
            }
            .__agy_btn_confirm:hover {
              filter: brightness(1.12) !important;
              transform: translateY(-1px) !important;
            }
          \`;
          document.head.appendChild(style);

          // ── Backdrop ──────────────────────────────────────────
          var backdrop = document.createElement('div');
          backdrop.id = '__agy_modal_overlay';
          backdrop.className = '__agy_backdrop';

          // ── Card ──────────────────────────────────────────────
          var card = document.createElement('div');
          card.className = '__agy_card';

          // ── Header ────────────────────────────────────────────
          var header = document.createElement('div');
          header.className = '__agy_header';

          var iconWrap = document.createElement('div');
          iconWrap.className = '__agy_icon_wrap';
          iconWrap.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

          var titleEl = document.createElement('div');
          titleEl.className = '__agy_title';
          titleEl.textContent = '${title}';

          header.appendChild(iconWrap);
          header.appendChild(titleEl);

          // ── Message ───────────────────────────────────────────
          var msgEl = document.createElement('p');
          msgEl.className = '__agy_msg';
          msgEl.textContent = '${message}';

          // ── Divider ───────────────────────────────────────────
          var divider = document.createElement('div');
          divider.className = '__agy_divider';

          // ── Buttons ───────────────────────────────────────────
          var btnRow = document.createElement('div');
          btnRow.className = '__agy_btn_row';

          var cancelBtn = document.createElement('button');
          cancelBtn.className = '__agy_btn __agy_btn_cancel';
          cancelBtn.textContent = '${cancelLabel}';
          cancelBtn.onclick = function() {
            try { window.chrome.webview.postMessage(JSON.stringify({type:'modal-cancel'})); } catch(e){}
          };

          var confirmBtn = document.createElement('button');
          confirmBtn.className = '__agy_btn __agy_btn_confirm';
          confirmBtn.textContent = '${confirmLabel}';
          confirmBtn.onclick = function() {
            try { window.chrome.webview.postMessage(JSON.stringify({type:'modal-confirm'})); } catch(e){}
          };

          btnRow.appendChild(cancelBtn);
          btnRow.appendChild(confirmBtn);

          card.appendChild(header);
          card.appendChild(msgEl);
          card.appendChild(divider);
          card.appendChild(btnRow);
          backdrop.appendChild(card);
          document.body.appendChild(backdrop);
        })();
      `);
    } else {
      try {
        const channel = new BroadcastChannel("editor_channel");
        channel.postMessage({ type: "close-confirm-modal" });
        channel.close();
      } catch (e) {}

      evalInCanvas(`
        (function() {
          var d = document.getElementById('__agy_modal_overlay');
          if (d) d.remove();
          var s = document.getElementById('__agy_modal_style');
          if (s) s.remove();
        })();
      `);
    }

    return () => {
      try {
        const channel = new BroadcastChannel("editor_channel");
        channel.postMessage({ type: "close-confirm-modal" });
        channel.close();
      } catch (e) {}

      evalInCanvas(`
        (function() {
          var d = document.getElementById('__agy_modal_overlay');
          if (d) d.remove();
          var s = document.getElementById('__agy_modal_style');
          if (s) s.remove();
        })();
      `);
    };
  }, [isOpen, title, message, confirmLabel, cancelLabel]);

  if (!isOpen) return null;

  // 2. Render ONLY the full-screen backdrop overlay in the parent window
  // (This blurs/darkens the left panel, top bar, and right panel without rendering a 2nd card)
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "fadeIn 0.18s ease",
        pointerEvents: "auto",
      }}
      onClick={onCancel}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ConfirmModal;
