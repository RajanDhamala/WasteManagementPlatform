function ChatBubble({ msg, CurrentUser, formatTime }) {

  const isUser = msg.senderId === CurrentUser?._id;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-md px-4 py-2 rounded-2xl ${
          isUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        {!isUser && <div className="text-xs font-semibold mb-1">{msg.senderName}</div>}
        <p>{msg.message}</p>
        <div
          className={`text-xs mt-1 flex justify-end ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTime(msg.timestamp || Date.now())}
        </div>
      </div>
    </div>
  );
}

export default ChatBubble
