import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`;

export default function Sidebar({ items = [], title = "Dialysis CRM" }) {
  return (
    <aside className="hidden w-64 flex-col border-r bg-white p-4 md:flex">
      <div className="mb-4 text-lg font-semibold">{title}</div>
      <nav className="grid gap-1">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} className={linkClass} end={it.end}>
            {it.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 text-xs text-slate-400">Craft4Dev</div>
    </aside>
  );
}
