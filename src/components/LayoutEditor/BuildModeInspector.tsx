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

// ── Image Inspector ───────────────────────────────────────────────────────────
const ImageInspector: React.FC<{ element: any }> = ({ element }) => {
  const attrs = parseImgAttributes(element?.elementCode ?? "");
  const [src, setSrc] = useState(attrs.src);
  const [alt, setAlt] = useState(attrs.alt);
  const [width, setWidth] = useState(attrs.width);
  const [href, setHref] = useState(attrs.href);
  const [align, setAlign] = useState(attrs.align);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const a = parseImgAttributes(element?.elementCode ?? "");
    setSrc(a.src); setAlt(a.alt); setWidth(a.width); setHref(a.href); setAlign(a.align);
  }, [element?.elementCode]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const pmId = (window as any).__currentPmId as string | undefined;
    const hasIpc = typeof (window as any).save_asset_to_project === "function";
    const filename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const relPath = `assets/${filename}`;

    // Track last uploaded filename globally for saving sanitization
    (window as any).__lastUploadedFilename = filename;

    // Set src immediately to relative path "assets/filename"
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

        // Save physical asset file to disk via native IPC into project assets folder
        (window as any).save_asset_to_project(pmId, filename, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const apply = () => {
    console.log("[BuildModeInspector] Apply clicked! Element:", element, "src:", src);
    const elIdAttr = element?.elementId ? ` data-el-id="${element.elementId}"` : "";
    const alignStyle = align ? ` text-align:${align};` : "";
    let finalSrc = src;
    const lastFilename = (window as any).__lastUploadedFilename;
    if (finalSrc.startsWith("data:image/") || finalSrc.startsWith("blob:") || finalSrc.startsWith("file:///")) {
      if (lastFilename) {
        finalSrc = `assets/${lastFilename}`;
      }
    }

    const img = `<img src="${finalSrc}" alt="${alt}"${width ? ` width="${width}"` : ""}${elIdAttr} style="display:block; max-width:100%; border:none; border-radius:6px;${alignStyle}" />`;
    const html = href
      ? `<a href="${href}" target="_blank" style="display:block; text-align:${align};">${img}</a>`
      : img;
    console.log("[BuildModeInspector] Generated HTML:", html);
    applyElementUpdate(html, element);
  };

  const displaySrc = (src && (window as any).__lastDataUrl && src.startsWith("assets/"))
    ? (window as any).__lastDataUrl
    : src;

  return (
    <>
      {displaySrc && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <img src={displaySrc} alt={alt} style={{ maxWidth: "100%", maxHeight: "80px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
        </div>
      )}
      <label style={label}>Image URL</label>
      <input style={field} value={src} placeholder="https://…" onChange={e => setSrc(e.target.value)} />

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
      <button onClick={() => fileRef.current?.click()}
        style={{ ...field, marginTop: "6px", background: "#eff6ff", color: "#2563eb", border: "1px dashed #93c5fd", cursor: "pointer", textAlign: "center", fontWeight: 700 }}>
        📁 Upload Image
      </button>

      <label style={label}>Alt Text</label>
      <input style={field} value={alt} placeholder="Describe the image…" onChange={e => setAlt(e.target.value)} />

      <label style={label}>Link (href)</label>
      <input style={field} value={href} placeholder="https://…" onChange={e => setHref(e.target.value)} />

      <label style={label}>Width (px)</label>
      <input style={field} type="number" value={width} placeholder="600" onChange={e => setWidth(e.target.value)} />

      <label style={label}>Alignment</label>
      <div style={segRow}>
        {(["left","center","right"] as const).map(a => (
          <button key={a} style={seg(align === a)} onClick={() => setAlign(a)}>{a}</button>
        ))}
      </div>

      <button style={applyBtn} onClick={apply}>✅ Apply</button>
    </>
  );
};

// ── Enhanced Text & Container Inspector ───────────────────────────────────────
function parseElementDetails(outerHTML: string) {
  const div = document.createElement("div");
  div.innerHTML = outerHTML;

  const fsm = outerHTML.match(/font-size:\s*([\d.]+)px/i);
  const cm = outerHTML.match(/color:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/i);
  const bgm = outerHTML.match(/background(?:-color)?:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/i);
  const fwm = outerHTML.match(/font-weight:\s*(\w+)/i);
  const tam = outerHTML.match(/text-align:\s*(\w+)/i);
  const lhm = outerHTML.match(/line-height:\s*([\d.]+)/i);
  const pdm = outerHTML.match(/padding:\s*([\d.\s\w]+)/i);

  return {
    text: div.textContent?.trim() ?? "",
    fontSize: fsm?.[1] ?? "14",
    color: cm?.[1] ?? "#151515",
    bgColor: bgm?.[1] ?? "",
    fontWeight: fwm?.[1] ?? "normal",
    align: tam?.[1] ?? "left",
    lineHeight: lhm?.[1] ?? "1.6",
    padding: pdm?.[1] ?? "6px 0",
  };
}

// ── Text Inspector ────────────────────────────────────────────────────────────
const TextInspector: React.FC<{ element: any }> = ({ element }) => {
  const parsed = parseElementDetails(element?.elementCode ?? "");
  const [text, setText] = useState(parsed.text);
  const [fontSize, setFontSize] = useState(parsed.fontSize);
  const [color, setColor] = useState(parsed.color);
  const [bgColor, setBgColor] = useState(parsed.bgColor);
  const [fontWeight, setFontWeight] = useState(parsed.fontWeight);
  const [align, setAlign] = useState(parsed.align);
  const [lineHeight, setLineHeight] = useState(parsed.lineHeight);

  useEffect(() => {
    const p = parseElementDetails(element?.elementCode ?? "");
    setText(p.text);
    setFontSize(p.fontSize);
    setColor(p.color);
    setBgColor(p.bgColor);
    setFontWeight(p.fontWeight);
    setAlign(p.align);
    setLineHeight(p.lineHeight);
  }, [element?.elementCode]);

  const apply = () => {
    const tag = element?.tagName ?? "p";
    const bgStyle = bgColor ? `background-color:${bgColor};` : "";
    const styleStr = `font-size:${fontSize}px;color:${color};${bgStyle}font-weight:${fontWeight};text-align:${align};margin:0;padding:6px 0;line-height:${lineHeight};`;
    applyElementUpdate(`<${tag} style="${styleStr}">${text}</${tag}>`, element);
  };

  return (
    <>
      <label style={label}>Text Content</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
        style={{ ...field, resize: "vertical" }} placeholder="Enter text…" />

      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Size (px)</label>
          <input style={field} type="number" value={fontSize} onChange={e => setFontSize(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Color</label>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <input type="color" value={color.startsWith("#") ? color : "#151515"} onChange={e => setColor(e.target.value)}
              style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px", cursor: "pointer" }} />
            <input style={{ ...field, flex: 1 }} value={color} onChange={e => setColor(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Line Height</label>
          <input style={field} type="number" step="0.1" value={lineHeight} onChange={e => setLineHeight(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Bg Color</label>
          <input style={field} value={bgColor} placeholder="#ffffff" onChange={e => setBgColor(e.target.value)} />
        </div>
      </div>

      <label style={label}>Weight</label>
      <div style={segRow}>
        {[["normal","Normal"],["600","Semi"],["bold","Bold"],["800","Extra"]].map(([v,l]) => (
          <button key={v} style={seg(fontWeight === v)} onClick={() => setFontWeight(v)}>{l}</button>
        ))}
      </div>

      <label style={label}>Alignment</label>
      <div style={segRow}>
        {(["left","center","right"] as const).map(a => (
          <button key={a} style={seg(align === a)} onClick={() => setAlign(a)}>{a}</button>
        ))}
      </div>

      <button style={applyBtn} onClick={apply}>✅ Apply</button>
    </>
  );
};

// ── Link Inspector ────────────────────────────────────────────────────────────
const LinkInspector: React.FC<{ element: any }> = ({ element }) => {
  const attrs = parseLinkAttributes(element?.elementCode ?? "");
  const [href, setHref] = useState(attrs.href);
  const [text, setText] = useState(attrs.text);
  const [target, setTarget] = useState(attrs.target);
  const [color, setColor] = useState(attrs.color);
  const [deco, setDeco] = useState("none");

  useEffect(() => {
    const a = parseLinkAttributes(element?.elementCode ?? "");
    setHref(a.href); setText(a.text); setTarget(a.target); setColor(a.color);
  }, [element?.elementCode]);

  const apply = () => {
    applyElementUpdate(`<a href="${href}" target="${target}" style="color:${color};text-decoration:${deco};font-weight:bold;">${text}</a>`, element);
  };

  return (
    <>
      <label style={label}>Link Text</label>
      <input style={field} value={text} placeholder="Click here" onChange={e => setText(e.target.value)} />

      <label style={label}>URL</label>
      <input style={field} value={href} placeholder="https://…" onChange={e => setHref(e.target.value)} />

      <label style={label}>Color</label>
      <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "4px" }}>
        <input type="color" value={color.startsWith("#") ? color : "#164194"} onChange={e => setColor(e.target.value)}
          style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "2px", cursor: "pointer" }} />
        <input style={{ ...field, flex: 1 }} value={color} onChange={e => setColor(e.target.value)} />
      </div>

      <label style={label}>Open In</label>
      <div style={segRow}>
        {[["_blank","New Tab"],["_self","Same Tab"]].map(([v,l]) => (
          <button key={v} style={seg(target === v)} onClick={() => setTarget(v)}>{l}</button>
        ))}
      </div>

      <label style={label}>Decoration</label>
      <div style={segRow}>
        {[["none","None"],["underline","Underline"]].map(([v,l]) => (
          <button key={v} style={seg(deco === v)} onClick={() => setDeco(v)}>{l}</button>
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
  const isParent = category === "BLOCK" || elTag === "tr" || elTag === "tbody" || elTag === "table";
  const isImg = category === "CImage" || category === "CIMG" || elTag === "img";
  const isLink = category === "CtaButton" || category === "CTA" || elTag === "a";

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

