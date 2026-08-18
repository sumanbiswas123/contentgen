import React, { useEffect, useRef, useState } from "react";

function applyElementUpdate(newOuterHTML: string, element: any) {
  window.postMessage({
    type: "update-element-html",
    newOuterHTML,
    elementId: element?.elementId || "",
    oldOuterHTML: element?.elementCode || element?.outerHTML || "",
    blockIndex: element?.blockIndex ?? 0,
    blockCode: element?.blockCode || "",
    tagName: element?.tagName || "",
  }, "*");
}

function parseImgAttributes(outerHTML: string) {
  const srcMatch = outerHTML.match(/src=["']([^"']*)["']/i);
  const altMatch = outerHTML.match(/alt=["']([^"']*)["']/i);
  const widthMatch = outerHTML.match(/width=["']?(\d+)["']?/i);
  const heightMatch = outerHTML.match(/height=["']?([^"'\s]+)["']?/i);
  const hrefMatch = outerHTML.match(/href=["']([^"']*)["']/i);
  const alignMatch = outerHTML.match(/text-align:\s*(\w+)/i);
  return {
    src: srcMatch?.[1] ?? "",
    alt: altMatch?.[1] ?? "",
    width: widthMatch?.[1] ?? "",
    height: heightMatch?.[1] ?? "",
    href: hrefMatch?.[1] ?? "",
    align: alignMatch?.[1] ?? "center",
  };
}

function parseTextElement(outerHTML: string) {
  const div = document.createElement("div");
  div.innerHTML = outerHTML;
  const fsm = outerHTML.match(/font-size:\s*([\d.]+)px/i);
  const cm = outerHTML.match(/color:\s*(#[0-9a-fA-F]{3,8})/i);
  const fwm = outerHTML.match(/font-weight:\s*(\w+)/i);
  const tam = outerHTML.match(/text-align:\s*(\w+)/i);
  return {
    text: div.textContent?.trim() ?? "",
    fontSize: fsm?.[1] ?? "14",
    color: cm?.[1] ?? "#151515",
    fontWeight: fwm?.[1] ?? "normal",
    align: tam?.[1] ?? "left",
  };
}

function parseLinkAttributes(outerHTML: string) {
  const hrefMatch = outerHTML.match(/href=["']([^"']*)["']/i);
  const targetMatch = outerHTML.match(/target=["']([^"']*)["']/i);
  const colorMatch = outerHTML.match(/color:\s*(#[0-9a-fA-F]{3,8})/i);
  const div = document.createElement("div");
  div.innerHTML = outerHTML;
  return {
    href: hrefMatch?.[1] ?? "",
    target: targetMatch?.[1] ?? "_blank",
    text: div.textContent?.trim() ?? "",
    color: colorMatch?.[1] ?? "#164194",
  };
}

// ── Shared field styles ───────────────────────────────────────────────────────
const field: React.CSSProperties = {
  width: "100%", padding: "7px 10px", borderRadius: "7px",
  border: "1px solid #e2e8f0", fontSize: "12px", outline: "none",
  background: "#f8fafc", color: "#1e293b", boxSizing: "border-box",
  fontFamily: "inherit",
};
const label: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 700,
  color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em",
  marginBottom: "4px", marginTop: "10px",
};
const applyBtn: React.CSSProperties = {
  width: "100%", padding: "9px", marginTop: "14px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "#fff", border: "none", borderRadius: "8px",
  cursor: "pointer", fontSize: "12px", fontWeight: 700,
  letterSpacing: "0.03em",
};
const segRow: React.CSSProperties = { display: "flex", gap: "5px", marginTop: "4px" };
const seg = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: "5px 0", border: "1px solid",
  borderColor: active ? "#2563eb" : "#e2e8f0",
  background: active ? "#eff6ff" : "#f8fafc",
  color: active ? "#2563eb" : "#94a3b8",
  borderRadius: "6px", cursor: "pointer",
  fontSize: "11px", fontWeight: 600,
});

// ── Image Inspector with Full CSS Styling ─────────────────────────────────────
function parseComprehensiveImgAttributes(outerHTML: string) {
  const srcMatch = outerHTML.match(/src=["']([^"']*)["']/i);
  const altMatch = outerHTML.match(/alt=["']([^"']*)["']/i);
  const widthMatch = outerHTML.match(/width=["']?(\d+)["']?/i);
  const heightMatch = outerHTML.match(/height=["']?([^"'\s]+)["']?/i);
  const hrefMatch = outerHTML.match(/href=["']([^"']*)["']/i);
  const alignMatch = outerHTML.match(/text-align:\s*(\w+)/i);

  // CSS Styles
  const brMatch = outerHTML.match(/border-radius:\s*([\d.]+)px/i);
  const bwMatch = outerHTML.match(/border-width:\s*([\d.]+)px/i);
  const bcMatch = outerHTML.match(/border-color:\s*([^;]+)/i);
  const bsMatch = outerHTML.match(/border-style:\s*(\w+)/i);
  const ptMatch = outerHTML.match(/padding-top:\s*([\d.]+)px/i);
  const pbMatch = outerHTML.match(/padding-bottom:\s*([\d.]+)px/i);
  const plMatch = outerHTML.match(/padding-left:\s*([\d.]+)px/i);
  const prMatch = outerHTML.match(/padding-right:\s*([\d.]+)px/i);
  const bgMatch = outerHTML.match(/background(?:-color)?:\s*([^;]+)/i);
  const opMatch = outerHTML.match(/opacity:\s*([\d.]+)/i);

  return {
    src: srcMatch?.[1] ?? "",
    alt: altMatch?.[1] ?? "",
    width: widthMatch?.[1] ?? "",
    height: heightMatch?.[1] ?? "",
    href: hrefMatch?.[1] ?? "",
    align: alignMatch?.[1] ?? "center",
    borderRadius: brMatch?.[1] ?? "6",
    borderWidth: bwMatch?.[1] ?? "0",
    borderColor: bcMatch?.[1]?.trim() ?? "#cbd5e1",
    borderStyle: bsMatch?.[1]?.trim() ?? "solid",
    paddingTop: ptMatch?.[1] ?? "0",
    paddingBottom: pbMatch?.[1] ?? "0",
    paddingLeft: plMatch?.[1] ?? "0",
    paddingRight: prMatch?.[1] ?? "0",
    bgColor: bgMatch?.[1]?.trim() ?? "transparent",
    opacity: opMatch?.[1] ?? "1",
  };
}

const ImageInspector: React.FC<{ element: any }> = ({ element }) => {
  const attrs = parseComprehensiveImgAttributes(element?.elementCode ?? "");
  const [src, setSrc] = useState(attrs.src);
  const [alt, setAlt] = useState(attrs.alt);
  const [width, setWidth] = useState(attrs.width);
  const [href, setHref] = useState(attrs.href);
  const [align, setAlign] = useState(attrs.align);

  const [borderRadius, setBorderRadius] = useState(attrs.borderRadius);
  const [borderWidth, setBorderWidth] = useState(attrs.borderWidth);
  const [borderColor, setBorderColor] = useState(attrs.borderColor);
  const [borderStyle, setBorderStyle] = useState(attrs.borderStyle);

  const [paddingTop, setPaddingTop] = useState(attrs.paddingTop);
  const [paddingBottom, setPaddingBottom] = useState(attrs.paddingBottom);
  const [paddingLeft, setPaddingLeft] = useState(attrs.paddingLeft);
  const [paddingRight, setPaddingRight] = useState(attrs.paddingRight);

  const [bgColor, setBgColor] = useState(attrs.bgColor);
  const [opacity, setOpacity] = useState(attrs.opacity);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const a = parseComprehensiveImgAttributes(element?.elementCode ?? "");
    setSrc(a.src); setAlt(a.alt); setWidth(a.width); setHref(a.href); setAlign(a.align);
    setBorderRadius(a.borderRadius); setBorderWidth(a.borderWidth); setBorderColor(a.borderColor); setBorderStyle(a.borderStyle);
    setPaddingTop(a.paddingTop); setPaddingBottom(a.paddingBottom); setPaddingLeft(a.paddingLeft); setPaddingRight(a.paddingRight);
    setBgColor(a.bgColor); setOpacity(a.opacity);
  }, [element?.elementCode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const pmId = (window as any).__currentPmId as string | undefined;
    const hasIpc = typeof (window as any).save_asset_to_project === "function";
    const filename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const relPath = `assets/${filename}`;

    (window as any).__lastUploadedFilename = filename;
    setSrc(relPath);

    if (pmId && hasIpc) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1] ?? "";

        (window as any).__onAssetSaved = (res: { assetPath: string; relativePath: string }) => {
          delete (window as any).__onAssetSaved;
          console.log("[BuildModeInspector] Asset saved to project disk:", res.relativePath);
        };

        (window as any).save_asset_to_project(pmId, filename, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const apply = () => {
    const elIdAttr = element?.elementId ? ` data-el-id="${element.elementId}"` : "";
    const alignStyle = align ? ` text-align:${align};` : "";
    let finalSrc = src;
    const lastFilename = (window as any).__lastUploadedFilename;
    if (finalSrc.startsWith("data:image/") || finalSrc.startsWith("blob:") || finalSrc.startsWith("file:///")) {
      if (lastFilename) {
        finalSrc = `assets/${lastFilename}`;
      }
    }

    const borderCss = parseInt(borderWidth, 10) > 0 ? `border: ${borderWidth}px ${borderStyle} ${borderColor}; ` : "border: none; ";
    const radiusCss = parseInt(borderRadius, 10) > 0 ? `border-radius: ${borderRadius}px; ` : "";
    const bgCss = bgColor && bgColor !== "transparent" ? `background-color: ${bgColor}; ` : "";
    const opCss = opacity && opacity !== "1" ? `opacity: ${opacity}; ` : "";
    const padCss = `padding-top: ${paddingTop}px; padding-bottom: ${paddingBottom}px; padding-left: ${paddingLeft}px; padding-right: ${paddingRight}px; `;

    const imgStyle = `display: block; max-width: 100%; height: auto; ${borderCss}${radiusCss}${bgCss}${opCss}${padCss}${alignStyle}`.trim();

    const img = `<img src="${finalSrc}" alt="${alt}"${width ? ` width="${width}"` : ""}${elIdAttr} style="${imgStyle}" />`;
    const html = href
      ? `<a href="${href}" target="_blank" style="display:block; text-align:${align};">${img}</a>`
      : img;
    applyElementUpdate(html, element);
  };

  const displaySrc = (src && (window as any).__lastDataUrl && src.startsWith("assets/"))
    ? (window as any).__lastDataUrl
    : src;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {displaySrc && (
        <div style={{ textAlign: "center", marginBottom: "4px" }}>
          <img src={displaySrc} alt={alt} style={{ maxWidth: "100%", maxHeight: "90px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
        </div>
      )}
      
      {/* Source & Upload */}
      <div>
        <label style={label}>Image URL</label>
        <input style={field} value={src} placeholder="https://…" onChange={e => setSrc(e.target.value)} />

        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        <button onClick={() => fileRef.current?.click()}
          style={{ ...field, marginTop: "6px", background: "#eff6ff", color: "#2563eb", border: "1px dashed #93c5fd", cursor: "pointer", textAlign: "center", fontWeight: 700 }}>
          📁 Upload Image
        </button>
      </div>

      <div>
        <label style={label}>Alt Text</label>
        <input style={field} value={alt} placeholder="Describe the image…" onChange={e => setAlt(e.target.value)} />
      </div>

      <div>
        <label style={label}>Link (href)</label>
        <input style={field} value={href} placeholder="https://…" onChange={e => setHref(e.target.value)} />
      </div>

      {/* Dimensions & Alignment */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dimensions & Alignment</span>
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Width (px)</label>
            <input style={field} type="number" value={width} placeholder="600" onChange={e => setWidth(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Opacity</label>
            <input style={field} type="number" step="0.1" min="0" max="1" value={opacity} onChange={e => setOpacity(e.target.value)} />
          </div>
        </div>

        <label style={label}>Alignment</label>
        <div style={segRow}>
          {(["left","center","right"] as const).map(a => (
            <button key={a} type="button" style={seg(align === a)} onClick={() => setAlign(a)}>{a}</button>
          ))}
        </div>
      </div>

      {/* Border & Corner Radius */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Border & Radius</span>
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Border Radius</label>
            <input style={field} type="number" value={borderRadius} onChange={e => setBorderRadius(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Border Width</label>
            <input style={field} type="number" value={borderWidth} onChange={e => setBorderWidth(e.target.value)} />
          </div>
        </div>

        {parseInt(borderWidth, 10) > 0 && (
          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Border Style</label>
              <select style={field} value={borderStyle} onChange={e => setBorderStyle(e.target.value)}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Border Color</label>
              <input style={field} value={borderColor} onChange={e => setBorderColor(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Padding & Background */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Padding & Background</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
          <div>
            <label style={{ ...label, marginTop: "0px" }}>Top</label>
            <input style={field} type="number" value={paddingTop} onChange={e => setPaddingTop(e.target.value)} />
          </div>
          <div>
            <label style={{ ...label, marginTop: "0px" }}>Bottom</label>
            <input style={field} type="number" value={paddingBottom} onChange={e => setPaddingBottom(e.target.value)} />
          </div>
          <div>
            <label style={{ ...label, marginTop: "0px" }}>Left</label>
            <input style={field} type="number" value={paddingLeft} onChange={e => setPaddingLeft(e.target.value)} />
          </div>
          <div>
            <label style={{ ...label, marginTop: "0px" }}>Right</label>
            <input style={field} type="number" value={paddingRight} onChange={e => setPaddingRight(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: "6px" }}>
          <label style={label}>Background Color</label>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <input
              type="color"
              value={bgColor.startsWith("#") ? bgColor : "#ffffff"}
              onChange={e => setBgColor(e.target.value)}
              style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px", cursor: "pointer" }}
            />
            <input style={{ ...field, flex: 1 }} value={bgColor} placeholder="transparent" onChange={e => setBgColor(e.target.value)} />
          </div>
        </div>
      </div>

      <button style={applyBtn} onClick={apply}>✅ Apply</button>
    </div>
  );
};

// ── Enhanced Full CSS Element Inspector ─────────────────────────────────────
function parseComprehensiveCss(outerHTML: string) {
  const div = document.createElement("div");
  div.innerHTML = outerHTML;
  const target = div.firstElementChild as HTMLElement || div;

  const fsm = outerHTML.match(/font-size:\s*([\d.]+)px/i);
  const cm = outerHTML.match(/(?:^|[;\s])color:\s*([^;]+)/i);
  const bgm = outerHTML.match(/background(?:-color)?:\s*([^;]+)/i);
  const ffm = outerHTML.match(/font-family:\s*([^;]+)/i);
  const fwm = outerHTML.match(/font-weight:\s*([^;]+)/i);
  const fsmStyle = outerHTML.match(/font-style:\s*([^;]+)/i);
  const tam = outerHTML.match(/text-align:\s*(\w+)/i);
  const tdm = outerHTML.match(/text-decoration:\s*([^;]+)/i);
  const ttm = outerHTML.match(/text-transform:\s*([^;]+)/i);
  const lhm = outerHTML.match(/line-height:\s*([\d.]+(?:px|em|%)?)/i);
  const lsm = outerHTML.match(/letter-spacing:\s*([\d.]+(?:px|em)?)/i);

  // Padding
  const ptMatch = outerHTML.match(/padding-top:\s*([\d.]+)px/i);
  const pbMatch = outerHTML.match(/padding-bottom:\s*([\d.]+)px/i);
  const plMatch = outerHTML.match(/padding-left:\s*([\d.]+)px/i);
  const prMatch = outerHTML.match(/padding-right:\s*([\d.]+)px/i);
  const padGeneral = outerHTML.match(/padding:\s*([\d.\s\w]+)/i);

  // Border & Radius
  const bwMatch = outerHTML.match(/border-width:\s*([\d.]+)px/i);
  const bcMatch = outerHTML.match(/border-color:\s*([^;]+)/i);
  const bsMatch = outerHTML.match(/border-style:\s*(\w+)/i);
  const brMatch = outerHTML.match(/border-radius:\s*([\d.]+)px/i);
  const bGeneral = outerHTML.match(/border:\s*([^;]+)/i);

  return {
    text: target.textContent?.trim() ?? "",
    fontFamily: ffm?.[1]?.trim() ?? "Arial, Helvetica, sans-serif",
    fontSize: fsm?.[1] ?? "14",
    color: cm?.[1]?.trim() ?? "#334155",
    bgColor: bgm?.[1]?.trim() ?? "transparent",
    fontWeight: fwm?.[1]?.trim() ?? "normal",
    fontStyle: fsmStyle?.[1]?.trim() ?? "normal",
    align: tam?.[1]?.trim() ?? "left",
    textDecoration: tdm?.[1]?.trim() ?? "none",
    textTransform: ttm?.[1]?.trim() ?? "none",
    lineHeight: lhm?.[1]?.trim() ?? "1.5",
    letterSpacing: lsm?.[1]?.trim() ?? "0px",
    paddingTop: ptMatch?.[1] ?? "12",
    paddingBottom: pbMatch?.[1] ?? "12",
    paddingLeft: plMatch?.[1] ?? "16",
    paddingRight: prMatch?.[1] ?? "16",
    borderWidth: bwMatch?.[1] ?? "0",
    borderColor: bcMatch?.[1]?.trim() ?? "#cbd5e1",
    borderStyle: bsMatch?.[1]?.trim() ?? "solid",
    borderRadius: brMatch?.[1] ?? "0",
  };
}

// ── Complete CSS Property Inspector ──────────────────────────────────────────
const TextInspector: React.FC<{ element: any }> = ({ element }) => {
  const parsed = parseComprehensiveCss(element?.elementCode ?? "");
  const [text, setText] = useState(parsed.text);
  const [fontFamily, setFontFamily] = useState(parsed.fontFamily);
  const [fontSize, setFontSize] = useState(parsed.fontSize);
  const [color, setColor] = useState(parsed.color);
  const [bgColor, setBgColor] = useState(parsed.bgColor);
  const [fontWeight, setFontWeight] = useState(parsed.fontWeight);
  const [fontStyle, setFontStyle] = useState(parsed.fontStyle);
  const [align, setAlign] = useState(parsed.align);
  const [textDecoration, setTextDecoration] = useState(parsed.textDecoration);
  const [textTransform, setTextTransform] = useState(parsed.textTransform);
  const [lineHeight, setLineHeight] = useState(parsed.lineHeight);
  const [letterSpacing, setLetterSpacing] = useState(parsed.letterSpacing);

  const [paddingTop, setPaddingTop] = useState(parsed.paddingTop);
  const [paddingBottom, setPaddingBottom] = useState(parsed.paddingBottom);
  const [paddingLeft, setPaddingLeft] = useState(parsed.paddingLeft);
  const [paddingRight, setPaddingRight] = useState(parsed.paddingRight);

  const [borderWidth, setBorderWidth] = useState(parsed.borderWidth);
  const [borderColor, setBorderColor] = useState(parsed.borderColor);
  const [borderStyle, setBorderStyle] = useState(parsed.borderStyle);
  const [borderRadius, setBorderRadius] = useState(parsed.borderRadius);

  useEffect(() => {
    const p = parseComprehensiveCss(element?.elementCode ?? "");
    setText(p.text);
    setFontFamily(p.fontFamily);
    setFontSize(p.fontSize);
    setColor(p.color);
    setBgColor(p.bgColor);
    setFontWeight(p.fontWeight);
    setFontStyle(p.fontStyle);
    setAlign(p.align);
    setTextDecoration(p.textDecoration);
    setTextTransform(p.textTransform);
    setLineHeight(p.lineHeight);
    setLetterSpacing(p.letterSpacing);
    setPaddingTop(p.paddingTop);
    setPaddingBottom(p.paddingBottom);
    setPaddingLeft(p.paddingLeft);
    setPaddingRight(p.paddingRight);
    setBorderWidth(p.borderWidth);
    setBorderColor(p.borderColor);
    setBorderStyle(p.borderStyle);
    setBorderRadius(p.borderRadius);
  }, [element?.elementCode]);

  const apply = () => {
    const tag = element?.tagName ?? "p";
    const bgCss = bgColor && bgColor !== "transparent" ? `background-color: ${bgColor}; ` : "";
    const borderCss = parseInt(borderWidth, 10) > 0 ? `border: ${borderWidth}px ${borderStyle} ${borderColor}; ` : "";
    const radiusCss = parseInt(borderRadius, 10) > 0 ? `border-radius: ${borderRadius}px; ` : "";
    const styleStr = `font-family: ${fontFamily}; font-size: ${fontSize}px; color: ${color}; ${bgCss}font-weight: ${fontWeight}; font-style: ${fontStyle}; text-align: ${align}; text-decoration: ${textDecoration}; text-transform: ${textTransform}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}; padding-top: ${paddingTop}px; padding-bottom: ${paddingBottom}px; padding-left: ${paddingLeft}px; padding-right: ${paddingRight}px; ${borderCss}${radiusCss}margin: 0;`;
    applyElementUpdate(`<${tag} style="${styleStr}">${text}</${tag}>`, element);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Text Content */}
      <div>
        <label style={label}>Text Content</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          style={{ ...field, resize: "vertical" }}
          placeholder="Enter text..."
        />
      </div>

      {/* Typography Section */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Typography</span>
        
        <label style={label}>Font Family</label>
        <select style={field} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
          <option value="Arial, Helvetica, sans-serif">Arial / Sans-Serif</option>
          <option value="'Segoe UI', Roboto, sans-serif">Segoe UI / Modern</option>
          <option value="Georgia, serif">Georgia / Serif</option>
          <option value="'Times New Roman', Times, serif">Times New Roman</option>
          <option value="'Courier New', Courier, monospace">Courier New / Mono</option>
          <option value="Tahoma, sans-serif">Tahoma</option>
          <option value="Verdana, sans-serif">Verdana</option>
        </select>

        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Size (px)</label>
            <input style={field} type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Line Height</label>
            <input style={field} type="text" value={lineHeight} onChange={(e) => setLineHeight(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Font Weight</label>
            <select style={field} value={fontWeight} onChange={(e) => setFontWeight(e.target.value)}>
              <option value="normal">400 - Normal</option>
              <option value="500">500 - Medium</option>
              <option value="600">600 - SemiBold</option>
              <option value="bold">700 - Bold</option>
              <option value="800">800 - ExtraBold</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Letter Spacing</label>
            <input style={field} type="text" value={letterSpacing} placeholder="0px" onChange={(e) => setLetterSpacing(e.target.value)} />
          </div>
        </div>

        <label style={label}>Alignment</label>
        <div style={segRow}>
          {(["left", "center", "right", "justify"] as const).map((a) => (
            <button key={a} type="button" style={seg(align === a)} onClick={() => setAlign(a)}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Colors & Background */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Colors & Fill</span>
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Text Color</label>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <input
                type="color"
                value={color.startsWith("#") ? color : "#334155"}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px", cursor: "pointer" }}
              />
              <input style={{ ...field, flex: 1 }} value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Background</label>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <input
                type="color"
                value={bgColor.startsWith("#") ? bgColor : "#ffffff"}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px", cursor: "pointer" }}
              />
              <input style={{ ...field, flex: 1 }} value={bgColor} placeholder="transparent" onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Padding & Spacing */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Padding (px)</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
          <div>
            <label style={{ ...label, marginTop: "0px" }}>Top</label>
            <input style={field} type="number" value={paddingTop} onChange={(e) => setPaddingTop(e.target.value)} />
          </div>
          <div>
            <label style={{ ...label, marginTop: "0px" }}>Bottom</label>
            <input style={field} type="number" value={paddingBottom} onChange={(e) => setPaddingBottom(e.target.value)} />
          </div>
          <div>
            <label style={{ ...label, marginTop: "0px" }}>Left</label>
            <input style={field} type="number" value={paddingLeft} onChange={(e) => setPaddingLeft(e.target.value)} />
          </div>
          <div>
            <label style={{ ...label, marginTop: "0px" }}>Right</label>
            <input style={field} type="number" value={paddingRight} onChange={(e) => setPaddingRight(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Border & Corner Radius */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Border & Radius</span>
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Border Width</label>
            <input style={field} type="number" value={borderWidth} onChange={(e) => setBorderWidth(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Border Radius</label>
            <input style={field} type="number" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} />
          </div>
        </div>
        {parseInt(borderWidth, 10) > 0 && (
          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Border Style</label>
              <select style={field} value={borderStyle} onChange={(e) => setBorderStyle(e.target.value)}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Border Color</label>
              <input style={field} value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <button style={applyBtn} onClick={apply}>✅ Apply Changes</button>
    </div>
  );
};

// ── Link Inspector ────────────────────────────────────────────────────────────
const LinkInspector: React.FC<{ element: any }> = ({ element }) => {
  const attrs = parseLinkAttributes(element?.elementCode ?? "");
  const [href, setHref] = useState(attrs.href);
  const [text, setText] = useState(attrs.text);
  const [target, setTarget] = useState(attrs.target);
  const [color, setColor] = useState(attrs.color);
  const [bgColor, setBgColor] = useState("#0284c7");
  const [paddingY, setPaddingY] = useState("12");
  const [paddingX, setPaddingX] = useState("24");
  const [borderRadius, setBorderRadius] = useState("8");
  const [fontSize, setFontSize] = useState("15");

  useEffect(() => {
    const a = parseLinkAttributes(element?.elementCode ?? "");
    setHref(a.href); setText(a.text); setTarget(a.target); setColor(a.color);
  }, [element?.elementCode]);

  const apply = () => {
    const btnStyle = `background-color:${bgColor};color:${color};display:inline-block;font-family:Arial,sans-serif;font-size:${fontSize}px;font-weight:bold;line-height:1.2;text-align:center;text-decoration:none;padding:${paddingY}px ${paddingX}px;border-radius:${borderRadius}px;box-shadow:0 4px 12px rgba(2,132,199,0.25);`;
    applyElementUpdate(`<a href="${href}" target="${target}" style="${btnStyle}">${text}</a>`, element);
  };

  return (
    <>
      <label style={label}>Button / Link Text</label>
      <input style={field} value={text} placeholder="Click here" onChange={e => setText(e.target.value)} />

      <label style={label}>Target URL (href)</label>
      <input style={field} value={href} placeholder="https://…" onChange={e => setHref(e.target.value)} />

      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Text Color</label>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <input type="color" value={color.startsWith("#") ? color : "#ffffff"} onChange={e => setColor(e.target.value)}
              style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px", cursor: "pointer" }} />
            <input style={{ ...field, flex: 1 }} value={color} onChange={e => setColor(e.target.value)} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Background Color</label>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <input type="color" value={bgColor.startsWith("#") ? bgColor : "#0284c7"} onChange={e => setBgColor(e.target.value)}
              style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px", cursor: "pointer" }} />
            <input style={{ ...field, flex: 1 }} value={bgColor} onChange={e => setBgColor(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Padding Y (px)</label>
          <input style={field} type="number" value={paddingY} onChange={e => setPaddingY(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Padding X (px)</label>
          <input style={field} type="number" value={paddingX} onChange={e => setPaddingX(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Border Radius</label>
          <input style={field} type="number" value={borderRadius} onChange={e => setBorderRadius(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Font Size</label>
          <input style={field} type="number" value={fontSize} onChange={e => setFontSize(e.target.value)} />
        </div>
      </div>

      <label style={label}>Open In</label>
      <div style={segRow}>
        {[["_blank","New Tab"],["_self","Same Tab"]].map(([v,l]) => (
          <button key={v} style={seg(target === v)} onClick={() => setTarget(v)}>{l}</button>
        ))}
      </div>

      <button style={applyBtn} onClick={apply}>✅ Apply</button>
    </>
  );
};

// ── Parent Block Inspector ───────────────────────────────────────────────────
const ParentBlockInspector: React.FC<{ element: any }> = ({ element }) => {
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(1);
  const [isResponsive, setIsResponsive] = useState(false);

  useEffect(() => {
    const code = element?.blockCode || element?.outerHTML || "";
    const rowsMatch = code.match(/data-rows=["']?(\d+)["']?/i);
    const colsMatch = code.match(/data-cols=["']?(\d+)["']?/i);
    const respMatch = code.match(/data-is-responsive=["']?(true|false)["']?/i);

    if (rowsMatch) setRows(parseInt(rowsMatch[1], 10));
    if (colsMatch) setCols(parseInt(colsMatch[1], 10));
    if (respMatch) setIsResponsive(respMatch[1] === "true");
  }, [element]);

  const applyMatrix = (r: number, c: number) => {
    setRows(r);
    setCols(c);
    window.postMessage({
      type: "bento-update-grid-matrix",
      blockIndex: element?.blockIndex ?? 0,
      rows: r,
      cols: c
    }, "*");
  };

  const toggleMobileWrap = (resp: boolean) => {
    setIsResponsive(resp);
    window.postMessage({
      type: "toggle-block-responsiveness",
      blockIndex: element?.blockIndex ?? 0,
      isResponsive: resp
    }, "*");
  };

  return (
    <>
      <div style={{ background: "rgba(2, 132, 199, 0.08)", padding: "10px", borderRadius: "8px", border: "1px dashed #0284c7", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7" }}>🍱 Parent Grid Layout Section</span>
      </div>

      <label style={label}>Row & Column Structure</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
        {[
          [1, 1, "1 Single Block"],
          [1, 2, "1 Row × 2 Cols"],
          [1, 3, "1 Row × 3 Cols"],
          [2, 2, "2 Rows × 2 Cols"],
          [2, 3, "2 Rows × 3 Cols"],
          [3, 3, "3 Rows × 3 Cols"]
        ].map(([r, c, name]) => (
          <button
            key={`${r}x${c}`}
            style={{
              padding: "8px 6px",
              border: rows === r && cols === c ? "2px solid #0284c7" : "1px solid #cbd5e1",
              background: rows === r && cols === c ? "#e0f2fe" : "#ffffff",
              color: rows === r && cols === c ? "#0369a1" : "#334155",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={() => applyMatrix(r as number, c as number)}
          >
            {name}
          </button>
        ))}
      </div>

      <label style={label}>Mobile Stacking (Flex-Wrap)</label>
      <div style={segRow}>
        <button style={seg(isResponsive)} onClick={() => toggleMobileWrap(true)}>📱 Mobile Stack (100%)</button>
        <button style={seg(!isResponsive)} onClick={() => toggleMobileWrap(false)}>🖥️ Desktop Fixed</button>
      </div>

      <p style={{ fontSize: "11px", color: "#64748b", marginTop: "10px", lineHeight: "1.4" }}>
        💡 Drag the vertical divider lines on the canvas to resize individual columns proportionally.
      </p>
    </>
  );
};

// ── Root ─────────────────────────────────────────────────────────────────────
const BuildModeInspector: React.FC<{ category: string | null; onClose: () => void }> = ({ category }) => {
  const [element, setElement] = useState<any>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === "string") { try { data = JSON.parse(data); } catch (e) {} }
      if (data?.type === "build-element-data") setElement(data.element);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!element) {
    return (
      <div style={{ textAlign: "center", padding: "32px 16px", color: "#94a3b8" }}>
        <div style={{ fontSize: "30px", marginBottom: "8px" }}>👆</div>
        <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5" }}>Click any element on the canvas to load its properties here.</p>
      </div>
    );
  }

  const elTag = (element?.tagName ?? "").toLowerCase();
  const html = element?.outerHTML || element?.elementCode || "";
  const isDropBox = html.includes("bento-child-drop-box") || html.includes("bento-parent-block-drop-box") || html.includes("Block: Drag components here");
  const isParent = category === "BLOCK" || elTag === "tr" || elTag === "tbody" || elTag === "table" || elTag === "td" || isDropBox;
  const isImg = !isParent && (category === "CImage" || category === "CIMG" || elTag === "img");
  const isLink = !isParent && (category === "CtaButton" || category === "CTA" || elTag === "a");

  return (
    <div style={{ padding: "0 2px" }}>
      {isParent ? (
        <ParentBlockInspector element={element} />
      ) : isImg ? (
        <ImageInspector element={element} />
      ) : isLink ? (
        <LinkInspector element={element} />
      ) : (
        <TextInspector element={element} />
      )}
    </div>
  );
};

export default BuildModeInspector;

