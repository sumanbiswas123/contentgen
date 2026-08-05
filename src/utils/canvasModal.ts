export interface CanvasModalInput {
  id: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface CanvasModalOptions {
  title: string;
  titleAccent?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "success" | "primary";
  inputs?: CanvasModalInput[];
  onConfirm: (inputValues: Record<string, string>) => void;
  onCancel?: () => void;
}

let currentCancelHandler: (() => void) | null = null;
let currentConfirmHandler: ((inputValues: Record<string, string>) => void) | null = null;

// Global IPC listener initialization flag
let isListenerInitialized = false;

function ensureGlobalListener() {
  if (isListenerInitialized) return;
  isListenerInitialized = true;

  const existingHandler = (window as any).__onChildMessage;
  (window as any).__onChildMessage = (data: any) => {
    if (existingHandler) {
      try { existingHandler(data); } catch(e){}
    }
    if (data?.type === "agy-modal-submit") {
      if (currentConfirmHandler) {
        currentConfirmHandler(data.values || {});
      }
      closeCanvasModal();
    } else if (data?.type === "agy-modal-cancel") {
      if (currentCancelHandler) {
        currentCancelHandler();
      }
      closeCanvasModal();
    }
  };
}

/**
 * Clean helper function to trigger a full-app centered modal anywhere in the application.
 * Parent window gets a dark backdrop blur, and the child WebView canvas renders the modal card.
 */
export function showCanvasModal(options: CanvasModalOptions) {
  ensureGlobalListener();

  currentConfirmHandler = options.onConfirm;
  currentCancelHandler = options.onCancel || null;

  const title = options.title || "Confirmation";
  const titleAccent = options.titleAccent || "";
  const message = options.message || "";
  const confirmLabel = options.confirmLabel || "Confirm";
  const cancelLabel = options.cancelLabel || "Cancel";
  const variant = options.confirmVariant || "primary";
  const inputs = options.inputs || [];

  // Variant gradient colors
  let btnGradient = "linear-gradient(135deg, #3b82f6, #2563eb)";
  let btnShadow = "0 4px 14px rgba(59, 130, 246, 0.4)";
  let iconColor = "#3b82f6";
  let iconBg = "rgba(59, 130, 246, 0.15)";
  let iconBorder = "rgba(59, 130, 246, 0.25)";

  if (variant === "danger") {
    btnGradient = "linear-gradient(135deg, #ef4444, #dc2626)";
    btnShadow = "0 4px 14px rgba(239, 68, 68, 0.4)";
    iconColor = "#ef4444";
    iconBg = "rgba(239, 68, 68, 0.15)";
    iconBorder = "rgba(239, 68, 68, 0.25)";
  } else if (variant === "success") {
    btnGradient = "linear-gradient(135deg, #22c55e, #16a34a)";
    btnShadow = "0 4px 14px rgba(34, 197, 94, 0.4)";
    iconColor = "#22c55e";
    iconBg = "rgba(34, 197, 94, 0.15)";
    iconBorder = "rgba(34, 197, 94, 0.25)";
  }

  // 1. Create Parent Window Backdrop Blur
  removeParentBackdrop();
  const backdrop = document.createElement("div");
  backdrop.id = "__agy_parent_backdrop";
  backdrop.style.cssText = [
    "position:fixed", "top:0", "left:0", "right:0", "bottom:0",
    "width:100vw", "height:100vh", "z-index:2147483647",
    "background:rgba(0,0,0,0.65)", "backdrop-filter:blur(8px)",
    "-webkit-backdrop-filter:blur(8px)", "animation:__agy_fade 0.18s ease",
    "pointer-events:auto"
  ].join(";");
  backdrop.onclick = () => {
    if (currentCancelHandler) currentCancelHandler();
    closeCanvasModal();
  };
  document.body.appendChild(backdrop);

  // 2. Inject Modal Card into Child Canvas WebView
  const evalInCanvas = (js: string) => {
    if (typeof (window as any).eval_child_js === "function") {
      (window as any).eval_child_js(js);
    }
  };

  const inputsJson = JSON.stringify(inputs);

  evalInCanvas(`
    (function() {
      var ex = document.getElementById('__agy_canvas_overlay');
      if (ex) ex.remove();
      var exStyle = document.getElementById('__agy_canvas_style');
      if (exStyle) exStyle.remove();

      var style = document.createElement('style');
      style.id = '__agy_canvas_style';
      style.textContent = \`
        @keyframes __agy_fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes __agy_slide { from { opacity: 0; transform: translateY(18px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .__agy_backdrop {
          position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
          width: 100vw !important; height: 100vh !important; z-index: 999999 !important;
          background: rgba(0, 0, 0, 0.65) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          animation: __agy_fade 0.18s ease !important; box-sizing: border-box !important; margin: 0 !important; padding: 0 !important;
        }

        .__agy_card {
          background: #181824 !important; border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 18px !important; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
          padding: 24px 26px 20px !important; width: 400px !important; max-width: calc(100vw - 40px) !important;
          box-sizing: border-box !important; animation: __agy_slide 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          display: flex !important; flex-direction: column !important;
        }

        .__agy_header { display: flex !important; align-items: center; justify-content: space-between !important; margin-bottom: 14px !important; }
        .__agy_header_left { display: flex !important; align-items: center !important; gap: 12px !important; }
        .__agy_icon_wrap {
          width: 40px !important; height: 40px !important; border-radius: 12px !important;
          background: ${iconBg} !important; border: 1px solid ${iconBorder} !important;
          display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;
        }
        .__agy_title { margin: 0 !important; font-size: 16px !important; font-weight: 700 !important; color: #f8fafc !important; letter-spacing: -0.01em !important; }
        .__agy_msg { margin: 0 0 16px 0 !important; font-size: 13.5px !important; color: #94a3b8 !important; line-height: 1.5 !important; }

        .__agy_input {
          width: 100% !important; background: rgba(255, 255, 255, 0.06) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important; border-radius: 10px !important;
          padding: 10px 14px !important; color: #f8fafc !important; font-size: 13.5px !important;
          margin-bottom: 12px !important; box-sizing: border-box !important; outline: none !important;
        }
        .__agy_input:focus { border-color: #3b82f6 !important; background: rgba(255, 255, 255, 0.09) !important; }

        .__agy_divider { height: 1px !important; background: rgba(255, 255, 255, 0.08) !important; margin: 6px 0 16px 0 !important; width: 100% !important; }
        .__agy_btn_row { display: flex !important; gap: 10px !important; justify-content: flex-end !important; align-items: center !important; }
        .__agy_btn { padding: 9px 20px !important; border-radius: 10px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; border: none !important; transition: all 0.15s ease !important; }
        .__agy_btn_cancel { background: rgba(255, 255, 255, 0.08) !important; color: #cbd5e1 !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
        .__agy_btn_cancel:hover { background: rgba(255, 255, 255, 0.14) !important; color: #ffffff !important; }
        .__agy_btn_submit { background: ${btnGradient} !important; color: #ffffff !important; box-shadow: ${btnShadow} !important; }
        .__agy_btn_submit:hover { filter: brightness(1.12) !important; transform: translateY(-1px) !important; }
      \`;
      document.head.appendChild(style);

      var backdrop = document.createElement('div');
      backdrop.id = '__agy_canvas_overlay';
      backdrop.className = '__agy_backdrop';

      var card = document.createElement('div');
      card.className = '__agy_card';

      var header = document.createElement('div');
      header.className = '__agy_header';
      
      var headerLeft = document.createElement('div');
      headerLeft.className = '__agy_header_left';
      
      var iconWrap = document.createElement('div');
      iconWrap.className = '__agy_icon_wrap';
      iconWrap.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

      var titleEl = document.createElement('div');
      titleEl.className = '__agy_title';
      titleEl.innerHTML = ${JSON.stringify(title)} + (${JSON.stringify(titleAccent)} ? ' <span style="color:${iconColor}">' + ${JSON.stringify(titleAccent)} + '</span>' : '');

      headerLeft.appendChild(iconWrap);
      headerLeft.appendChild(titleEl);
      header.appendChild(headerLeft);

      var msgEl = document.createElement('p');
      msgEl.className = '__agy_msg';
      msgEl.textContent = ${JSON.stringify(message)};

      card.appendChild(header);
      card.appendChild(msgEl);

      var inputConfigs = ${inputsJson};
      var inputEls = {};
      for (var i = 0; i < inputConfigs.length; i++) {
        var cfg = inputConfigs[i];
        var inp = document.createElement('input');
        inp.className = '__agy_input';
        inp.placeholder = cfg.placeholder || '';
        inp.type = cfg.type || 'text';
        inp.value = cfg.defaultValue || '';
        if (cfg.required) inp.required = true;
        card.appendChild(inp);
        inputEls[cfg.id] = inp;
      }

      var divider = document.createElement('div');
      divider.className = '__agy_divider';
      card.appendChild(divider);

      var btnRow = document.createElement('div');
      btnRow.className = '__agy_btn_row';

      var cancelBtn = document.createElement('button');
      cancelBtn.className = '__agy_btn __agy_btn_cancel';
      cancelBtn.textContent = ${JSON.stringify(cancelLabel)};
      cancelBtn.onclick = function() {
        try { window.chrome.webview.postMessage(JSON.stringify({type: 'agy-modal-cancel'})); } catch(e){}
      };

      var submitBtn = document.createElement('button');
      submitBtn.className = '__agy_btn __agy_btn_submit';
      submitBtn.textContent = ${JSON.stringify(confirmLabel)};
      submitBtn.onclick = function() {
        var vals = {};
        for (var key in inputEls) {
          var val = inputEls[key].value.trim();
          var cfgFind = inputConfigs.find(function(c){ return c.id === key; });
          if (cfgFind && cfgFind.required && !val) {
            inputEls[key].style.borderColor = '#ef4444';
            inputEls[key].focus();
            return;
          }
          vals[key] = val;
        }
        try {
          window.chrome.webview.postMessage(JSON.stringify({
            type: 'agy-modal-submit',
            values: vals
          }));
        } catch(e){}
      };

      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(submitBtn);
      card.appendChild(btnRow);
      backdrop.appendChild(card);
      document.body.appendChild(backdrop);

      // Focus first input if any
      if (inputConfigs.length > 0 && inputEls[inputConfigs[0].id]) {
        setTimeout(function() { inputEls[inputConfigs[0].id].focus(); }, 100);
      }
    })();
  `);
}

export function closeCanvasModal() {
  removeParentBackdrop();

  if (typeof (window as any).eval_child_js === "function") {
    (window as any).eval_child_js(`
      (function() {
        var d = document.getElementById('__agy_canvas_overlay');
        if (d) d.remove();
        var s = document.getElementById('__agy_canvas_style');
        if (s) s.remove();
      })();
    `);
  }

  currentConfirmHandler = null;
  currentCancelHandler = null;
}

function removeParentBackdrop() {
  const el = document.getElementById("__agy_parent_backdrop");
  if (el) el.remove();
}
