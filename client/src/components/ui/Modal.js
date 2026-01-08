import React from "react";
import Button from "./Button";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl" onMouseDown={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
