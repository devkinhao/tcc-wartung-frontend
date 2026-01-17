import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col relative">
        <Header />

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <div className="fixed bottom-6 right-6 z-50">
          <button className="w-14 h-14 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700">
            💬
          </button>
        </div>
      </div>
    </div>
  );
}
