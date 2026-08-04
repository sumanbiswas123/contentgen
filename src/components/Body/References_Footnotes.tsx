import React, { useState} from 'react';
import { useDispatch } from 'react-redux';
import { BookOpenText } from 'lucide-react';
import { getReference } from '../../Redux/ProductReducer/action';
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { stateToHTML } from "draft-js-export-html";
import { BsLink45Deg } from "react-icons/bs";
import { GrSuperscript } from "react-icons/gr";
import { AiOutlineItalic,AiOutlineBgColors ,AiOutlineOrderedList,AiOutlineUnorderedList} from "react-icons/ai";
import { FaBold } from "react-icons/fa";
import {VscReferences} from "react-icons/vsc"
import { GrSubscript } from "react-icons/gr";
import ReferencesIcon from "./image_assets/References.png"

const References_Footnotes = ({onContentChange,prevCode,stage,onClose,setSelectedCategory}: any) => {
  const [isReferenceModalOpen, setReferenceModalOpen] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [selectedTextDecoration, setSelectedTextDecoration] = useState("underline")
  const [isAnchorOpen, setAnchorModal] = useState(false);
  const [linkURL, setLinkURL] = useState("");
  const [selectedColor, setSelectedColor] = useState("#151515");
  const [selectedOption , setSelectedOption] = useState("points")
  const [sample, setSample] = useState<string[]>([])
  const [isbgColor, setBgColor] = useState("#ffffff")
  const [ isfontSize, setFontSize]  =useState("14")
  const [ReferenceHeading , setReferenceHeading] = useState("")

  const dispatch = useDispatch();

  const openReferenceModal = () => {
    if (setSelectedCategory) {
      setSelectedCategory("References_Footnotes");
    } else {
      setReferenceModalOpen(true);
    }
  };

  const closeReferenceModal = () => {
    setReferenceModalOpen(false);
  };

  const handleSelectChangeList = (event: any) => {
    setSelectedOption(event.target.value);
  };

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
      const entityKey = contentStateWithLink.getLastCreatedEntityKey();
      const contentStateWithEntities = Modifier.applyEntity(
        contentState,
        selection,
        entityKey
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

  const convertContentToHTML = (contentState: any) => {
    const options = {
      inlineStyles: {
        BOLD: { element: "strong" },
        ITALIC: { element: "em" },
        SUPERSCRIPT: {
          element: "font",
          attributes: {
            style: `font-size: ${Number(isfontSize)-4}px;line-height: 10px;vertical-align: ${4 + ((Number(isfontSize) - 14) / 2)}px;color: ${selectedColor};`,
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
        }
        return null;
      },
    };
    return stateToHTML(contentState, options);
  };

  const RefFootCode = () => {
    const contentState = editorState.getCurrentContent();
    const points = convertContentToHTML(contentState);
    const sample = points.split('\n');

    let pointsAll = "";

    for (let i = 0; i < sample.length; i++) {
      let pointEach = selectedOption === "num"
        ? `<tr>
      <td width="20" align="center" valign="top" style="
        font-family: Arial;
        font-size: ${isfontSize}px;
        font-weight: bold;
        color: #151515;
        line-height: ${+isfontSize + 6}px;
        text-align: left;
      ">${i + 1}.
      </td>
      <td align="center" valign="top" style="
        font-family: Arial;
        font-size: ${isfontSize}px;
        font-weight: normal;
        color: #151515;
        line-height: ${+isfontSize + 6}px;
        text-align: left;
      ">${sample[i]}
      </td>
    </tr>`
        : `<tr>
      <td width="20" align="center" valign="top" style="
        font-family: Arial;
        font-size: ${isfontSize}px;
        font-weight: bold;
        color: #151515;
        line-height: ${+isfontSize + 6}px;
        text-align: left;
      ">&bull;
      </td>
      <td align="center" valign="top" style="
        font-family: Arial;
        font-size: ${isfontSize}px;
        font-weight: normal;
        color: #151515;
        line-height: ${+isfontSize + 6}px;
        text-align: left;
      ">${sample[i]}
      </td>
    </tr>`;

      pointsAll += pointEach;
    }

    const RefHtml = `
    <tr>
    <td class="setPadding" align="center" valign="top" style="padding: 0px 20px" bgcolor="${isbgColor}">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody> 

    <tr>
    <td height="15" style="font-size: 1px">
    &nbsp;
    </td>
    </tr>

    <tr>
      <td align="center" valign="top" style="
        font-family: Arial;
        font-size: 12px;
        font-weight: bold;
        color: #151515;
        line-height: 18px;
        text-align: left;
        padding-bottom: 10px;
      ">${ReferenceHeading}
      </td>
    </tr>

    <tr>
    <td align="left" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody>
    ${pointsAll}
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    `;

    dispatch(getReference({type:"References",code:RefHtml}));
    closeReferenceModal();
  };
 
 const openAnchorModal = () => {
  setAnchorModal(true);
};

const closeAnchorModal = () => {
  setAnchorModal(false);
};
const handleBoldClick = () => {
  setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
};
const handleItalicClick = () => {
  setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
};
const handleSupersciptClick = () => {
  setEditorState(RichUtils.toggleInlineStyle(editorState, "SUPERSCRIPT"));
};

const handleSubscriptClick = () => {
  setEditorState(RichUtils.toggleInlineStyle(editorState, 'SUBSCRIPT'));
};

const RefEditCode =()=>{
  const contentState = editorState.getCurrentContent();
  const points = convertContentToHTML(contentState)
  const sample = points.split('\n');
  onContentChange(sample,selectedOption)
  closeReferenceModal()
}

const divStyle = {
  background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
  border: '2px solid transparent',
  margin:'2px',
};

if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Editor options */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", background: "#f8fafc", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
          <button type="button" onClick={handleBoldClick} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}><FaBold size={12} /></button>
          <button type="button" onClick={handleItalicClick} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}><AiOutlineItalic size={14} /></button>
          <button type="button" onClick={openAnchorModal} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}><BsLink45Deg size={14} /></button>
          <button type="button" onClick={handleSupersciptClick} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}><GrSuperscript size={13} /></button>
          <button type="button" onClick={handleSubscriptClick} style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}><GrSubscript size={13} /></button>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Heading Title</label>
          <input
            type="text"
            placeholder="References:"
            value={ReferenceHeading}
            onChange={(e) => setReferenceHeading(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>List Type</label>
          <select value={selectedOption} onChange={handleSelectChangeList} style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#ffffff" }}>
            <option value="points">Bullet Points</option>
            <option value="num">Numbered List</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Font Size (px)</label>
            <input type="text" value={isfontSize} onChange={(e)=>setFontSize(e.target.value)} style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>BG Color</label>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input type="color" value={isbgColor.startsWith("#") ? isbgColor : "#ffffff"} onChange={(e) => setBgColor(e.target.value)} style={{ width: "36px", height: "36px", padding: "2px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", backgroundColor: "#ffffff", boxSizing: "border-box" }} />
              <input value={isbgColor} onChange={(e)=>setBgColor(e.target.value)} style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Footnotes Content</label>
          <div style={{ border: "1px solid #cbd5e1", minHeight: "100px", borderRadius: "6px", padding: "10px", backgroundColor: "#ffffff" }}>
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              placeholder="Paste points here, each on a separate line..."
              spellCheck={true}
            />
          </div>
        </div>

        <button 
          onClick={() => {
            RefFootCode();
            if (onClose) onClose();
          }}
          style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "6px" }}
        >
          Apply References
        </button>
      </div>
    );
  }

const styles = {
  width: "500px",
  position: "relative" as const,
  margin: "10% auto",
  backgroundColor: "#F6F6F6",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column" as const,
  maxHeight: "80vh",
  overflowY: "auto" as const
}; 

  return (
    <div>
      <button className="Content_btn btn-accent" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openReferenceModal}>
        <div className="lucide-icon-box">
          <BookOpenText size={20} />
        </div>
        <span>References</span>
      </button>
    </div>
  );
};

export default References_Footnotes;
