import React, { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  ContentState,
  convertFromHTML
} from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import "draft-js/dist/Draft.css";
import { BsLink45Deg } from "react-icons/bs";
import { GrSuperscript } from "react-icons/gr";
import { AiOutlineItalic, AiOutlineBgColors } from "react-icons/ai";
import { FaBold } from "react-icons/fa";
import "./Editor.css"

const EditorReuse = ({ onContentChange, PrevCode, ModalStatus }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnchorOpen, setAnchorModal] = useState(false);
  const [isBgHighlightOpen, setBgHighlightModal] = useState(false);
  const [sidep, setSidep] = useState("20")
  const [topp, setTopp] = useState("5")
  const [preview, setPreview] = useState("")

  const mixedContent = `${PrevCode ? PrevCode : ""}`;
  const blocksFromHTML = convertFromHTML(mixedContent);
  const contentState = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );
  
  const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState));

  const [color, setColor] = useState("#151515");
  const [bgcolor, setBGColor] = useState("#ffffff");
  const [bgfullcolor, setFullBGColor] = useState("#ffffff")
  const [fontsize, setFontsize] = useState("14");
  const [align, setAlign] = useState("left");
  const [linkURL, setLinkURL] = useState("");
  const [selectedColor, setSelectedColor] = useState("#151515");
  const [selectedTextDecoration, setSelectedTextDecoration] = useState("underline");
  const [isSelectedBackgroundColor, setSelectedBackgroundColor] = useState("#ffffff");
  const [isSelectedTextColor, setSelectedTextColor] = useState("#151515");

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const openAnchorModal = () => {
    setAnchorModal(true);
  };

  const closeAnchorModal = () => {
    setAnchorModal(false);
  };

  const openBGHighlightColorModal = () => {
    setBgHighlightModal(true);
  };

  const closeBGHighlightColorModal = () => {
    setBgHighlightModal(false);
  };

  const handleBoldClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
  };

  const handleItalicClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
  };

  const handleSuperscriptClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "SUPERSCRIPT"));
  };

  const applyLink = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithLink = contentState.createEntity("LINK", "MUTABLE", {
        url: linkURL,
        color: selectedColor,
        textDecoration: selectedTextDecoration,
      });

      const linkEntityKey = contentStateWithLink.getLastCreatedEntityKey();
      let contentStateWithEntities = Modifier.applyEntity(
        contentState,
        selection,
        linkEntityKey
      );

      const editorStateWithEntities = EditorState.push(
        editorState,
        contentStateWithEntities,
        "apply-entities" as any
      );

      setEditorState(editorStateWithEntities);
      closeAnchorModal();
    }
  };

  const applyBGHighlight = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithHighlight = contentState.createEntity("HIGHLIGHT", "MUTABLE", {
        backgroundColor: isSelectedBackgroundColor,
        color: isSelectedTextColor,
      });

      const highlightEntityKey = contentStateWithHighlight.getLastCreatedEntityKey();
      let contentStateWithEntities = Modifier.applyEntity(
        contentState,
        selection,
        highlightEntityKey
      );

      const editorStateWithEntities = EditorState.push(
        editorState,
        contentStateWithEntities,
        "apply-entities" as any
      );

      setEditorState(editorStateWithEntities);
      closeBGHighlightColorModal();
    }
  };

  const convertContentToHTML = (contentState: any) => {
    const options = {
      inlineStyles: {
        BOLD: { element: "strong" },
        ITALIC: { element: "em" },
        SUPERSCRIPT: {
          element: "font",
          attributes: {
            style: `font-size: ${Number(fontsize)-4}px;line-height: 10px;vertical-align: ${4 + ((Number(fontsize) - 14) / 2)}px;color: #151515;`,
          },
        },
      },
      entityStyleFn: (entity: any) => {
        const entityType = entity.getType();
        if (entityType === "LINK") {
          const data = entity.getData();
          return {
            element: "a",
            attributes: {
              href: data.url,
              target: "_blank",
              style: `color:${data.color}; text-decoration: ${data.textDecoration};`,
            },
          };
        } else if (entityType === "HIGHLIGHT") {
          const data = entity.getData();
          return {
            element: "font",
            attributes: {
              style: `background-color:${data.backgroundColor}; color:${data.color}`,
            },
          };
        }
        return null;
      },
    };
    return stateToHTML(contentState, options);
  };

  const ParaCode = () => {
    const contentState = editorState.getCurrentContent();
    const html = convertContentToHTML(contentState);
    const htmlWithP = html.split("\n");
    let paraHtml = "";
    for (let i = 0; i < htmlWithP.length; i++) {
      let testHtml = htmlWithP[i].replace(/^<p>/, "").replace(/<\/p>$/, "");
      paraHtml += testHtml + `${htmlWithP.length === 1 ? "" : "<br/>"}`;
    }

    onContentChange(paraHtml, align, color, fontsize, bgcolor, bgfullcolor, sidep, topp);
    setIsOpen(false);
  };

  useEffect(() => {
    if (PrevCode) {
      const mixedContent = PrevCode;
      const blocksFromHTML = convertFromHTML(mixedContent);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    }
    openModal()
  }, [PrevCode, ModalStatus]);

  useEffect(() => {
    closeModal()
  }, [])

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const html = convertContentToHTML(contentState);
    const htmlWithP = html.split("\n");
    let paraHtml = "";
    for (let i = 0; i < htmlWithP.length; i++) {
      let testHtml = htmlWithP[i].replace(/^<p>/, "").replace(/<\/p>$/, "");
      paraHtml += testHtml + `${htmlWithP.length === 1 ? "" : "<br/>"}`;
    }
    setPreview(paraHtml)
  }, [editorState])

  return (
    <div>
      <button 
        id='ThemeButtonSave' 
        style={{ width: "100%", padding: "8px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px", background: "#fff", fontWeight: "bold" }} 
        onClick={openModal}
      >
        Text Editor
      </button>

      {/* Main Editor Modal */}
      {isOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }} id='AltNames'>Enter your Text</h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ overflowY: "auto" as const, flex: 1, paddingRight: "10px" }}>
              <div className="editorOptions" style={{ display: "flex", gap: "5px", marginBottom: "15px" }}>
                <button type="button" className="custom-Editor" onClick={handleBoldClick} style={{ padding: "6px 12px", cursor: "pointer", background: "#eee", border: "1px solid #ccc", borderRadius: "4px" }}>
                  <FaBold />
                </button>
                <button type="button" className="custom-Editor" onClick={handleItalicClick} style={{ padding: "6px 12px", cursor: "pointer", background: "#eee", border: "1px solid #ccc", borderRadius: "4px" }}>
                  <AiOutlineItalic />
                </button>
                <button type="button" className="custom-Editor" onClick={openAnchorModal} style={{ padding: "6px 12px", cursor: "pointer", background: "#eee", border: "1px solid #ccc", borderRadius: "4px" }}>
                  <BsLink45Deg />
                </button>
                <button type="button" className="custom-Editor" onClick={handleSuperscriptClick} style={{ padding: "6px 12px", cursor: "pointer", background: "#eee", border: "1px solid #ccc", borderRadius: "4px" }}>
                  <GrSuperscript />
                </button>
                <button type="button" className="custom-Editor" onClick={openBGHighlightColorModal} style={{ padding: "6px 12px", cursor: "pointer", background: "#eee", border: "1px solid #ccc", borderRadius: "4px" }}>
                  <AiOutlineBgColors />
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Font Size: </label>
                  <input
                    type="number"
                    placeholder="font-size - px"
                    value={fontsize}
                    onChange={(e) => setFontsize(e.target.value)}
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    className='InputBox'
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Font Color: </label>
                  <input
                    placeholder="color - #000000"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    className='InputBox'
                  />
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Paragraph Background</label>
                <input
                  placeholder="background color - #000000"
                  value={bgcolor}
                  onChange={(e) => setBGColor(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Padding Sides</label>
                  <input
                    type="number"
                    placeholder="Side Padding"
                    value={sidep}
                    onChange={(e) => setSidep(e.target.value)}
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    className='InputBox'
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Padding Top Bottom: </label>
                  <input
                    placeholder="Top padding"
                    type="number"
                    value={topp}
                    onChange={(e) => setTopp(e.target.value)}
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    className='InputBox'
                  />
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Paragraph Align</label>
                <select 
                  className='InputBox' 
                  value={align} 
                  onChange={(e) => setAlign(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="left">LEFT</option>
                  <option value="center">CENTER</option>
                  <option value="right">RIGHT</option>
                  <option value="justify">Justify</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Paragraph Full Background (optional)</label>
                <input
                  placeholder="background no padding - #000000"
                  value={bgfullcolor}
                  onChange={(e) => setFullBGColor(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Preview</label>
                <div style={{ border: "1px solid black", padding: "10px", minHeight: "40px" }}>
                  <div dangerouslySetInnerHTML={{ __html: preview }}></div>
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Editor</label>
                <div style={{ border: "1px solid black", minHeight: "150px", padding: "10px", overflowY: "auto" as const, cursor: "text" }}>
                  <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    placeholder="Paste your paragraph here"
                    spellCheck={true}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" as const, borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
              <button 
                id='ThemeButtonSave' 
                onClick={ParaCode} 
                style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", width: "100%" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anchor Modal */}
      {isAnchorOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1001 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Add Link</h3>
              <button onClick={closeAnchorModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <input
                type="url"
                placeholder="https://www.example.com"
                value={linkURL}
                onChange={(e) => setLinkURL(e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Enter Link Color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <select
                value={selectedTextDecoration}
                onChange={(e) => setSelectedTextDecoration(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="underline">Underline The Link</option>
                <option value="none">Remove Underline Link</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" as const, gap: "10px" }}>
              <button 
                type="button" 
                onClick={closeAnchorModal}
                style={{ padding: "8px 16px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={applyLink}
                style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background color Modal */}
      {isBgHighlightOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1001 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Add Color</h3>
              <button onClick={closeBGHighlightColorModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="backgroundcolor" style={{ display: "block", marginBottom: "5px" }}>Background color:</label>
              <input
                placeholder="Enter a background color"
                value={isSelectedBackgroundColor}
                onChange={(e) => setSelectedBackgroundColor(e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                id="backgroundcolor"
                autoFocus
              />
              <label htmlFor="textcolor" style={{ display: "block", marginBottom: "5px" }}>Text color:</label>
              <input
                placeholder="Enter a text color"
                value={isSelectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                id="textcolor"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" as const, gap: "10px" }}>
              <button 
                type="button" 
                onClick={closeBGHighlightColorModal}
                style={{ padding: "8px 16px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={applyBGHighlight}
                style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
              >
                Apply Color
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorReuse;
