import React from "react";
import Button from "../components/ui/Button";

export default function Topbar({ title, right }) {
  return (
    <div className="flex items-center justify-between border-b bg-white px-5 py-4"> 
      <div className="text-base font-semibold">{title}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
