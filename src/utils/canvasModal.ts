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

/**
 * Clean helper function to trigger a full-app centered modal anywhere in the application.
 * Renders backdrop blur and high-contrast card directly inside document.body.
 */
export function showCanvasModal(options: CanvasModalOptions) {
  closeCanvasModal();

  currentConfirmHandler = options.onConfirm;
  currentCancelHandler = options.onCancel || null;

  const title = options.title || "Confirmation";
  const titleAccent = options.titleAccent || "";
  const message = options.message || "";
  const confirmLabel = options.confirmLabel || "Confirm";
  const cancelLabel = options.cancelLabel || "Cancel";
  const variant = options.confirmVariant || "primary";
  const inputs = options.inputs || [];

  // Variant styling
  let btnGradient = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
  let btnShadow = "0 4px 14px rgba(2, 132, 199, 0.4)";
  let iconColor = "#0284c7";
  let iconBg = "rgba(2, 132, 199, 0.1)";

  if (variant === "danger") {
    btnGradient = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    btnShadow = "0 4px 14px rgba(239, 68, 68, 0.4)";
    iconColor = "#ef4444";
    iconBg = "rgba(239, 68, 68, 0.1)";
  } else if (variant === "success") {
    btnGradient = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    btnShadow = "0 4px 14px rgba(16, 185, 129, 0.4)";
    iconColor = "#10b981";
    iconBg = "rgba(16, 185, 129, 0.1)";
  }

  // 1. Create Modal Styles
  let styleEl = document.getElementById("__agy_modal_styles");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "__agy_modal_styles";
    styleEl.textContent = `
      @keyframes agyModalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes agyModalSlideUp {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 2. Create Backdrop
  const backdrop = document.createElement("div");
  backdrop.id = "__agy_parent_backdrop";
  backdrop.style.cssText = [
    "position: fixed", "top: 0", "left: 0", "right: 0", "bottom: 0",
    "width: 100vw", "height: 100vh", "z-index: 999999",
    "background: rgba(0, 0, 0, 0.65)", "backdrop-filter: blur(8px)",
    "-webkit-backdrop-filter: blur(8px)",
    "display: flex", "align-items: center", "justify-content: center",
    "animation: agyModalFadeIn 0.2s ease-out", "box-sizing: border-box"
  ].join(";");

  backdrop.onclick = (e) => {
    if (e.target === backdrop) {
      if (currentCancelHandler) currentCancelHandler();
      closeCanvasModal();
    }
  };

  // 3. Create Card
  const card = document.createElement("div");
  card.style.cssText = [
    "background: #ffffff", "border-radius: 16px", "padding: 28px 24px",
    "width: 90%", "max-width: 420px",
    "box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35)",
    "border: 1px solid rgba(226, 232, 240, 0.8)",
    "animation: agyModalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
    "box-sizing: border-box", "text-align: left", "font-family: Inter, sans-serif"
  ].join(";");

  // 4. Header Section
  const header = document.createElement("div");
  header.style.cssText = "display: flex; align-items: center; gap: 12px; margin-bottom: 12px;";

  const iconWrap = document.createElement("div");
  iconWrap.style.cssText = `width: 40px; height: 40px; border-radius: 10px; background: ${iconBg}; color: ${iconColor}; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0;`;
  iconWrap.innerHTML = "⚡";

  const titleEl = document.createElement("h3");
  titleEl.style.cssText = "margin: 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.3;";
  titleEl.innerHTML = title + (titleAccent ? ` <span style="color:${iconColor}">${titleAccent}</span>` : "");

  header.appendChild(iconWrap);
  header.appendChild(titleEl);

  // 5. Message
  const msgEl = document.createElement("p");
  msgEl.style.cssText = "margin: 0 0 20px 0; font-size: 13.5px; color: #64748b; line-height: 1.5;";
  msgEl.textContent = message;

  card.appendChild(header);
  card.appendChild(msgEl);

  // 6. Input Fields (if any)
  const inputEls: Record<string, HTMLInputElement> = {};
  inputs.forEach((cfg) => {
    const input = document.createElement("input");
    input.type = cfg.type || "text";
    input.placeholder = cfg.placeholder || "";
    input.value = cfg.defaultValue || "";
    input.style.cssText = [
      "width: 100%", "background: #f8fafc", "border: 1px solid #cbd5e1",
      "border-radius: 8px", "padding: 10px 14px", "font-size: 13.5px",
      "color: #0f172a", "margin-bottom: 12px", "box-sizing: border-box",
      "outline: none", "transition: border-color 0.15s ease"
    ].join(";");
    input.onfocus = () => { input.style.borderColor = iconColor; };
    input.onblur = () => { input.style.borderColor = "#cbd5e1"; };

    card.appendChild(input);
    inputEls[cfg.id] = input;
  });

  // 7. Buttons Row
  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = cancelLabel;
  cancelBtn.style.cssText = [
    "padding: 9px 18px", "border-radius: 8px", "border: 1px solid #cbd5e1",
    "background: #ffffff", "color: #334155", "font-weight: 600",
    "font-size: 13px", "cursor: pointer", "transition: all 0.15s ease"
  ].join(";");
  cancelBtn.onclick = () => {
    if (currentCancelHandler) currentCancelHandler();
    closeCanvasModal();
  };

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.textContent = confirmLabel;
  submitBtn.style.cssText = [
    "padding: 9px 18px", "border-radius: 8px", "border: none",
    `background: ${btnGradient}`, "color: #ffffff", "font-weight: 600",
    "font-size: 13px", "cursor: pointer", `box-shadow: ${btnShadow}`,
    "transition: all 0.15s ease"
  ].join(";");
  submitBtn.onclick = () => {
    const vals: Record<string, string> = {};
    for (const id in inputEls) {
      const val = inputEls[id].value.trim();
      const cfg = inputs.find((c) => c.id === id);
      if (cfg?.required && !val) {
        inputEls[id].style.borderColor = "#ef4444";
        inputEls[id].focus();
        return;
      }
      vals[id] = val;
    }
    if (currentConfirmHandler) {
      currentConfirmHandler(vals);
    }
    closeCanvasModal();
  };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(submitBtn);
  card.appendChild(btnRow);

  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  // Focus first input if any
  if (inputs.length > 0 && inputEls[inputs[0].id]) {
    setTimeout(() => inputEls[inputs[0].id].focus(), 100);
  }
}

export function closeCanvasModal() {
  const backdrop = document.getElementById("__agy_parent_backdrop");
  if (backdrop) backdrop.remove();

  currentConfirmHandler = null;
  currentCancelHandler = null;
}
