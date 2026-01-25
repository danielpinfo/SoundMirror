// /src/components/practice/Mouth3D.jsx
import React from "react";

export default function Mouth3D({
  phoneme,
  width = 320,
  height = 240,
  className = "",
}) {
  return (
    <div
      className={`rounded-xl border-2 border-slate-700 bg-slate-900 flex items-center justify-center text-xs text-slate-200 ${className}`}
      style={{ width, height }}
    >
      Mouth3D placeholder
      {phoneme ? ` (phoneme: ${phoneme})` : ""}
    </div>
  );
}