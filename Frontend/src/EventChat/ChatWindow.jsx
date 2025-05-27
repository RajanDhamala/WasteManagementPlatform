import { MessageCircle, Send } from "lucide-react";
import ChatBubble from "./ChatBubble";

export default function ChatWindow({
  messages,
  CurrentUser,
  formatTime,
  isTyping,
  typingUser,
  message,
  setMessage,
  handleSendMessage,
  handleTyping,
  messagesEndRef,
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!messages.length ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Select an event to start chatting</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                CurrentUser={CurrentUser}
                formatTime={formatTime}
              />
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-2xl">
                  <div className="text-xs font-semibold mb-1">{typingUser}</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white lg:rounded-bl-3xl">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type a message…"
            className="flex-1 p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
            disabled={!message}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
