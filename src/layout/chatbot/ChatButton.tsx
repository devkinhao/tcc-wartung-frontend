import { MdChat } from "react-icons/md";

export function ChatButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="
          w-14 h-14 rounded-full
          bg-principal-blue text-principal-white
          shadow-lg
          hover:bg-principal-green
          transition
          flex items-center justify-center
        "
      >
        <MdChat size={28} />
      </button>
    </div>
  );
}