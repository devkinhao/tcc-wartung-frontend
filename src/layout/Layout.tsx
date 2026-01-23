import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./header/Header";
import { ChatButton } from "./chatbot/ChatButton";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-screen font-sans">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

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

      <ChatButton />
    </div>
  );
}