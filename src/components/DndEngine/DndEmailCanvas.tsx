import React from "react";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EMAIL_COMPONENTS_CONFIG } from "../../config/componentsConfig";

export interface EmailBlockItem {
  type: string;
  code: string;
}

interface DndEmailCanvasProps {
  blocks: EmailBlockItem[];
  interactionMode: "create" | "edit";
  createSubmode: "add" | "move";
  onBlocksChange: (newBlocks: EmailBlockItem[]) => void;
  onSelectBlock?: (blockIndex: number, code: string) => void;
}

export const SortableBlockRow: React.FC<{
  id: string;
  index: number;
  block: EmailBlockItem;
  interactionMode: "create" | "edit";
  createSubmode: "add" | "move";
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onSelect: (index: number, code: string) => void;
}> = ({
  id,
  index,
  block,
  interactionMode,
  createSubmode,
  onDuplicate,
  onDelete,
  onSelect,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: "relative",
    marginBottom: "8px",
  };

  const isMoveMode = interactionMode === "create" && createSubmode === "move";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isMoveMode ? { ...attributes, ...listeners } : {})}
      className="dnd-block-row-wrapper"
      onClick={() => onSelect(index, block.code)}
    >
      {/* Visual AEM Dropzone & Action Overlay */}
      <div
        className="aem-block-overlay-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f8fafc",
          border: "1.5px dashed #94a3b8",
          borderRadius: "6px",
          padding: "6px 12px",
          marginBottom: "6px",
          cursor: isMoveMode ? "grab" : "default",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
          🧩 {isMoveMode ? "↕️ Drag to Move Block" : `Block ${index + 1}: Drag components here`}
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "11px",
              cursor: "pointer",
              fontWeight: 500,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(index);
            }}
            title="Duplicate Block"
          >
            📋 Duplicate
          </button>
          <button
            type="button"
            style={{
              background: "#ffffff",
              border: "1px solid #fca5a5",
              color: "#ef4444",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "11px",
              cursor: "pointer",
              fontWeight: 500,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            title="Delete Block"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Render raw email block HTML cleanly */}
      <div
        className="email-block-content"
        dangerouslySetInnerHTML={{ __html: block.code }}
      />
    </div>
  );
};

export const DndEmailCanvas: React.FC<DndEmailCanvasProps> = ({
  blocks,
  interactionMode,
  createSubmode,
  onBlocksChange,
  onSelectBlock,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blockIds = blocks.map((_, i) => `block-row-${i}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blockIds.indexOf(String(active.id));
      const newIndex = blockIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(blocks, oldIndex, newIndex);
        onBlocksChange(reordered);
      }
    }
  };

  const handleDuplicate = (index: number) => {
    if (index >= 0 && index < blocks.length) {
      const targetBlock = blocks[index];
      const cloned = { ...targetBlock };
      const updated = [...blocks];
      updated.splice(index + 1, 0, cloned);
      onBlocksChange(updated);
    }
  };

  const handleDelete = (index: number) => {
    if (index >= 0 && index < blocks.length) {
      const updated = blocks.filter((_, i) => i !== index);
      onBlocksChange(updated);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blockIds}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ width: "100%", height: "100%", background: "#ffffff", padding: "8px", boxSizing: "border-box" }}>
          {blocks.map((block, idx) => (
            <SortableBlockRow
              key={`block-row-${idx}-${block.type}`}
              id={`block-row-${idx}`}
              index={idx}
              block={block}
              interactionMode={interactionMode}
              createSubmode={createSubmode}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onSelect={(i, code) => {
                if (onSelectBlock) onSelectBlock(i, code);
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DndEmailCanvas;
