import React from "react";

export default function Button({ className = "", variant = "primary", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 bg-white hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
    ghost: "bg-transparent hover:bg-slate-100"
  };
  return <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props} />;
}
