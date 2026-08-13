import React, { useState } from "react";

interface ColumnResizeDividerProps {
  leftColIdx: number;
  onResize: (leftColIdx: number, newLeftWidthPct: number) => void;
  currentLeftWidthPct: number;
  currentRightWidthPct: number;
}

export const ColumnResizeDivider: React.FC<ColumnResizeDividerProps> = ({
  leftColIdx,
  onResize,
  currentLeftWidthPct,
  currentRightWidthPct,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const parentContainer = (e.currentTarget.parentElement || document.body) as HTMLElement;
    const totalWidth = parentContainer.getBoundingClientRect().width || 660;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = moveEvt.clientX - startX;
      const deltaPct = (deltaX / totalWidth) * 100;
      const newLeftPct = Math.min(85, Math.max(15, currentLeftWidthPct + deltaPct));
      onResize(leftColIdx, Math.round(newLeftPct * 100) / 100);
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: "absolute",
        top: 0,
        right: "-3px",
        width: "6px",
        height: "100%",
        cursor: "ew-resize",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDragging ? "#0284c7" : "transparent",
        transition: "background 0.15s ease",
      }}
    >
      <div
        style={{
          width: "2px",
          height: "100%",
          background: isDragging ? "#0284c7" : "#cbd5e1",
        }}
      />
    </div>
  );
};
