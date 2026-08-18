import React from "react";
import { Editor, Frame, Element, useNode, useEditor } from "@craftjs/core";
import { compileCraftToHtml } from "./serializers/craftToHtmlCompiler";

interface CraftCanvasProps {
  initialCode?: string;
  onCodeChange?: (html: string) => void;
  onSelectNode?: (code: string) => void;
}

export const BlockContainer: React.FC<{ children?: React.ReactNode; html?: string }> = ({ children, html }) => {
  const { 
    id,
    actions: { setProp },
    connectors: { connect, drag },
    selected,
    hovered 
  } = useNode((node) => ({
    selected: node.events.selected,
    hovered: node.events.hovered,
  }));

  const { actions: editorActions, query } = useEditor();

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      style={{
        position: "relative",
        marginBottom: "12px",
        outline: selected ? "2.5px solid #0284c7" : hovered ? "1.5px dashed #38bdf8" : "none",
        outlineOffset: "2px",
        borderRadius: "4px",
        transition: "outline 0.15s ease",
      }}
    >
      {/* Floating Action Menu on hover / select */}
      {(hovered || selected) && (
        <div
          style={{
            position: "absolute",
            top: "-32px",
            right: "0px",
            display: "flex",
            gap: "4px",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "2px 4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 9999,
          }}
        >
          <button
            type="button"
            title="Duplicate Block"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px 6px", fontSize: "11px" }}
            onClick={(e) => {
              e.stopPropagation();
              const node = query.node(id).get();
              if (node && node.data?.parent) {
                editorActions.add(
                  query.parseReactElement(<BlockContainer html={html} />).toNode(),
                  node.data.parent
                );
              }
            }}
          >
            📋
          </button>
          <button
            type="button"
            title="Delete Block"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px 6px", fontSize: "11px", color: "#ef4444" }}
            onClick={(e) => {
              e.stopPropagation();
              editorActions.delete(id);
            }}
          >
            🗑️
          </button>
        </div>
      )}

      {/* Render HTML content safely */}
      <div dangerouslySetInnerHTML={html ? { __html: html } : undefined} />
      {children}

      {/* Interactive Bottom Dropzone for new components */}
      <div
        style={{
          boxSizing: "border-box",
          height: "36px",
          marginTop: "6px",
          border: "1px dashed #cbd5e1",
          background: "#f8fafc",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          color: "#64748b",
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        <span>Block: Drag components here</span>
      </div>
    </div>
  );
};

(BlockContainer as any).craft = {
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
};

export const CraftCanvasRoot: React.FC<{ htmlContent?: string }> = ({ htmlContent }) => {
  return (
    <div style={{ width: "100%", height: "100%", background: "#ffffff", padding: "0", boxSizing: "border-box" }}>
      <Frame>
        <Element is={BlockContainer} canvas html={htmlContent} />
      </Frame>
    </div>
  );
};

const CraftCanvas: React.FC<CraftCanvasProps> = ({ initialCode, onCodeChange, onSelectNode }) => {
  return (
    <Editor
      resolver={{ BlockContainer }}
      onNodesChange={(query) => {
        if (onCodeChange) {
          const serializedNodes = query.getSerializedNodes();
          const nodeArray = Object.values(serializedNodes).map((n: any) => ({
            type: n.type?.resolvedName || "BLOCK",
            code: n.props?.html || "",
          }));
          const cleanHtml = compileCraftToHtml(nodeArray);
          onCodeChange(cleanHtml);
        }
      }}
      onSelectNode={(nodeId) => {
        if (onSelectNode && nodeId) {
          // Pass selected node code to editor dock
        }
      }}
    >
      <CraftCanvasRoot htmlContent={initialCode} />
    </Editor>
  );
};

export default CraftCanvas;
