import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MdChat } from "react-icons/md";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-screen font-sans">
      {/* SIDEBAR */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      {/* CONTEÚDO */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Header />

        <main className="flex-1 p-6 bg-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* CHAT */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 rounded-full bg-principal-blue text-principal-white shadow-lg hover:bg-principal-green transition flex items-center justify-center">
          <MdChat size={28} />
        </button>
      </div>
    </div>
  );
}