import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function CustomerService() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "cs"; text: string }[]>([
    { from: "cs", text: "Hello! Welcome to R7 Fortune. How can we help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "cs", text: "Thank you for your message! Our support team will reply shortly." },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-4 w-80 bg-[#14142a] border border-[#d4a85333] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col" style={{ height: "400px" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4a85322]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-[#f0e6d3] font-medium">Online Support</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#8a8aad] hover:text-[#f0e6d3]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                  msg.from === "user"
                    ? "bg-[#d4a853] text-[#0a0a0f]"
                    : "bg-[#0a0a0f] text-[#f0e6d3] border border-[#d4a85322]"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#d4a85322] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2 text-xs text-[#f0e6d3] placeholder-[#8a8aad66] focus:outline-none focus:border-[#d4a85388]"
            />
            <button onClick={handleSend} className="bg-[#d4a853] text-[#0a0a0f] rounded-lg p-2 hover:bg-[#e0b860] transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button - Bottom Right Fixed */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-[#d4a853] text-[#0a0a0f] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-pulse-glow"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </>
  );
}
