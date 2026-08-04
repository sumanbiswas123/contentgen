import React, { useEffect, useState } from "react";
import { getPara } from "../../Redux/ProductReducer/action";
import { useDispatch } from "react-redux";
import { Type } from "lucide-react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
} from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import "draft-js/dist/Draft.css";
import "./paraStyle.css";
import { BsLink45Deg, BsParagraph } from "react-icons/bs";
import { GrSuperscript, GrSubscript } from "react-icons/gr";
import { AiOutlineItalic, AiOutlineBgColors } from "react-icons/ai";
import { FaBold } from "react-icons/fa";
import ParagraphIcon from "./image_assets/Paragraph.png"
import { IoLinkSharp } from "react-icons/io5";

const ParagraphNew = ({onContentChange,stage,onClose,setSelectedCategory}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnchorOpen, setAnchorModal] = useState(false);
  const [isBgHighlightOpen, setBgHighlightModal] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [color, setColor] = useState("#151515");
  const [bgcolor, setBGColor] = useState("#ffffff");
  const [fontsize, setFontsize] = useState("14");
  const [align, setAlign] = useState("left");
  const [linkURL, setLinkURL] = useState("");
  const [selectedColor, setSelectedColor] = useState("#151515");
  const [selectedTextDecoration, setSelectedTextDecoration] = useState("underline");
  const [isSelectedBackgroundColor, setSelectedBackgroundColor] = useState("#ffffff");
  const [isSelectedTextColor, setSelectedTextColor] = useState("#151515");
  const [sidep, setSidep] = useState("20");
  const [topp, setTopp] = useState("5");
  const [bgfullwidthcolor, setBGFullwidthColor] = useState("#ffffff");
  const [preview, setPreview] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const dispatch = useDispatch();

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  const openModal = () => {
    if (setSelectedCategory) {
      setSelectedCategory("Paragraph");
    } else {
      setIsOpen(true);
    }
  };
  const closeModal = () => setIsOpen(false);
  const openAnchorModal = () => setAnchorModal(true);
  const closeAnchorModal = () => setAnchorModal(false);
  const openBGhighlightColorModal = () => setBgHighlightModal(true);
  const closeBGHighlightColorModal = () => setBgHighlightModal(false);

  const handleBoldClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
  const handleItalicClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
  const handleSuperscriptClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, "SUPERSCRIPT"));
  const handleSubscriptClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'SUBSCRIPT'));

  const applyLink = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithLink = contentState.createEntity(
        "LINK",
        "MUTABLE",
        {
          url: linkURL,
          color: selectedColor,
          textDecoration: selectedTextDecoration,
        }
      );
      const linkEntityKey = contentStateWithLink.getLastCreatedEntityKey();
      const contentStateWithEntities = Modifier.applyEntity(
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

  const applyHighlightColor = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithHighlight = contentState.createEntity(
        "HIGHLIGHT",
        "MUTABLE",
        {
          backgroundColor: isSelectedBackgroundColor,
          color: isSelectedTextColor,
        }
      );
      const highlightEntityKey = contentStateWithHighlight.getLastCreatedEntityKey();
      const contentStateWithEntities = Modifier.applyEntity(
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
            style: `font-size: ${Number(fontsize)-4}px;line-height: 10px;vertical-align: ${4 + ((Number(fontsize) - 14) / 2)}px;color: ${isSelectedTextColor};`,
          },
        },
        SUBSCRIPT:{
          element: "font",
          attributes : {
            style: `font-size: 60%;line-height: 150%;vertical-align: -10%;`,
          }
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
              style: `color:${data.color};text-decoration: ${data.textDecoration};`,
            },
          };
        } else if (entityType === "HIGHLIGHT") {
          const data = entity.getData();
          return {
            element: "font",
            attributes: {
              style: `background-color:${data.backgroundColor};color:${data.color}`,
            },
          };
        }
        return null;
      },
    };
    return stateToHTML(contentState, options);
  };

  const HandleParaEdit = () => {
    const contentState = editorState.getCurrentContent();
    var html = convertContentToHTML(contentState);
    let htmlWithP = html.split("\n");
    let paraHtml = "";
    for (let i = 0; i < htmlWithP.length; i++) {
      let testHtml = htmlWithP[i].replace(/^<p>/, "").replace(/<\/p>$/, "");
      paraHtml += testHtml + `${htmlWithP.length == 1 ? "" : ""}`;
    }

    const finalHtml = `<tr>
      <td
        align="left"
        valign="top"
        style="padding: 0px ${sidep}px; background-color: ${bgfullwidthcolor}"
        class="setPadding"
      >
        <table
          width="100%"
          border="0"
          cellspacing="0"
          cellpadding="0"
          role="presentation"
        >
          <tbody>
            <tr>
              <td
                align="${align}"
                valign="top"
                style="
                  color: ${color};
                  font-family: Arial;
                  font-size: ${fontsize}px;
                  line-height: ${+fontsize + 4}px;
                  background-color: ${bgcolor};
                  padding:${topp}px 0px;
                  mso-line-height-rule: exactly;
                "
              >
                ${paraHtml}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>`;

    onContentChange(finalHtml);
    setIsOpen(false);
  };

  const ParaCode = () => {
    const contentState = editorState.getCurrentContent();
    var html = convertContentToHTML(contentState);
    let htmlWithP = html.split("\n");
    let paraHtml = "";
    for (let i = 0; i < htmlWithP.length; i++) {
      let testHtml = htmlWithP[i].replace(/^<p>/, "").replace(/<\/p>$/, "");
      paraHtml += testHtml + `${htmlWithP.length == 1 ? "" : ""}`;
    }

    const finalHtml = `<tr>
      <td
        align="left"
        valign="top"
        style="padding: 0px ${sidep}px; background-color: ${bgfullwidthcolor}"
        class="setPadding"
      >
        <table
          width="100%"
          border="0"
          cellspacing="0"
          cellpadding="0"
          role="presentation"
        >
          <tbody>
            <tr>
              <td
                align="${align}"
                valign="top"
                style="
                  color: ${color};
                  font-family: Arial;
                  font-size: ${fontsize}px;
                  line-height: ${+fontsize + 4}px;
                  background-color: ${bgcolor};
                  padding:${topp}px 0px;
                  mso-line-height-rule: exactly;
                "
              >
                ${paraHtml}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>`;

    dispatch(getPara({ type: "Paragraph", code: finalHtml }));
    setIsOpen(false);
  };

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const html = convertContentToHTML(contentState);
    const htmlWithP = html.split("\n");
    let paraHtml = "";
    for (let i = 0; i < htmlWithP.length; i++) {
      let testHtml = htmlWithP[i].replace(/^<p>/, "").replace(/<\/p>$/, "");
      paraHtml += testHtml + `${htmlWithP.length == 1 ? "" : ""}`;
    }
    setPreview(paraHtml);
  }, [editorState]);

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Rich Formatting Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", background: "#f8fafc", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
          <button type="button" onClick={handleBoldClick} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }} title="Bold"><FaBold size={12} /></button>
          <button type="button" onClick={handleItalicClick} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }} title="Italic"><AiOutlineItalic size={14} /></button>
          <button type="button" onClick={handleSuperscriptClick} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }} title="Superscript"><GrSuperscript size={13} /></button>
          <button type="button" onClick={handleSubscriptClick} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }} title="Subscript"><GrSubscript size={13} /></button>
        </div>

        {/* Draft Editor Box */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Paragraph Content</label>
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "12px", minHeight: "120px", background: "#fff" }}>
            <Editor editorState={editorState} onChange={setEditorState} />
          </div>
        </div>

        {/* Typography & Layout Controls */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Font Size (px)</label>
            <input value={fontsize} onChange={(e) => setFontsize(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Alignment</label>
            <select value={align} onChange={(e) => setAlign(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#fff" }}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        {/* Color Pickers */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Text Color</label>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input type="color" value={color.startsWith("#") ? color : "#151515"} onChange={(e) => setColor(e.target.value)} style={{ width: "36px", height: "36px", padding: 0, border: "none", borderRadius: "6px", cursor: "pointer" }} />
              <input value={color} onChange={(e) => setColor(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>BG Color</label>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input type="color" value={bgcolor.startsWith("#") ? bgcolor : "#ffffff"} onChange={(e) => setBGColor(e.target.value)} style={{ width: "36px", height: "36px", padding: 0, border: "none", borderRadius: "6px", cursor: "pointer" }} />
              <input value={bgcolor} onChange={(e) => setBGColor(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            ParaCode();
            if (onClose) onClose();
          }}
          style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "6px" }}
        >
          Apply Paragraph
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="Content_btn btn-accent" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openModal}>
        <div className="lucide-icon-box">
          <Type size={20} />
        </div>
        <span>Paragraph</span>
      </button>
    </div>
  );
};

export default ParagraphNew;
