import React from "react";
import VisemeAnimator from "./practice/VisemeAnimator";

export default function HeadStage({
  className = "",
  style = {},
  text,
  letter,
  word,
  value,
  frame,          // optional: if LetterPractice passes slider frame, we will use it
  frameIndex,     // optional alternate name
  ...props
}) {
  // Prefer explicit letter, otherwise take first character from any provided text/word/value
  const raw = (letter ?? text ?? word ?? value ?? "").toString().toLowerCase();
  const singleLetter = (raw.match(/[a-z]/)?.[0]) || "m";

  // If the page passes a frame value, use it; otherwise VisemeAnimator will manage its own frame
  const externalFrame = typeof frame === "number" ? frame : (typeof frameIndex === "number" ? frameIndex : undefined);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0,
        ...style,
      }}
      className={className}
    >
      <VisemeAnimator
        token={singleLetter}
        frame={externalFrame}
        showInternalControls={false} // IMPORTANT: do NOT add a second slider on LetterPractice
      />
    </div>
  );
}