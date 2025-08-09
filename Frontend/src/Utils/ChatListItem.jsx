import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, getAvatarColor, formatDate, formatTime } from "../Utils/MessageUtil";
import { Users } from "lucide-react";
import { decryptMessage } from "../Utils/MessageUtil";

const ChatListItem = React.memo(function ChatListItem({ chat, unreadCount, setActiveChat, activeChat, CurrentUser, privateKey }) {
  // Get last message raw (no decrypt yet)
  const lastMessageRaw = React.useMemo(() => {
    if (chat?.Messages && chat?.Messages.length > 0) {
      return { ...chat?.Messages[chat.Messages.length - 1], publicKey: chat.publicKey || null };
    }
    return null;
  }, [chat.Messages, chat.publicKey]);

  const [decryptedMessage, setDecryptedMessage] = useState(null);

  useEffect(() => {
    setDecryptedMessage(null);

    if (!lastMessageRaw) return;

    if (lastMessageRaw.senderName === CurrentUser?.name) {
      setDecryptedMessage(lastMessageRaw.message);
      return;
    }
    async function decrypt() {
      try {
        const decrypted = await decryptMessage(lastMessageRaw.message, lastMessageRaw.publicKey, privateKey);
        setDecryptedMessage(decrypted);
      } catch (err) {
        console.error("Error decrypting message:", err);
        // fallback: show encrypted message if decrypt fails
        setDecryptedMessage(lastMessageRaw.message);
      }
    }

    decrypt();
  }, [lastMessageRaw, CurrentUser?.name, privateKey]);

  return (
    <div
      key={chat._id}
      onClick={() => {
        setActiveChat(chat);
      }}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        activeChat?._id === chat._id ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarFallback className={`${getAvatarColor(chat.title)} text-white font-medium`}>
              {chat.type === "group" ? <Users className="w-5 h-5" /> : getInitials(chat.title)}
            </AvatarFallback>
          </Avatar>
          {chat.type === "direct" && (
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                chat.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          )}
        </div>

        {/* Chat details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">
                {lastMessageRaw ? formatTime(lastMessageRaw.timestamp) : formatDate(chat.date)}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {decryptedMessage
              ? `${lastMessageRaw?.senderName === CurrentUser?.name ? "You: " : ""}${decryptedMessage}`
              : chat.type === "direct"
                ? "Start a conversation"
                : `Created on ${formatDate(chat.date)}`}
          </p>
        </div>

        {/* Unread count */}
        {unreadCount > 0 && (
          <Badge className="bg-blue-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center p-0">
            {unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
});

export default ChatListItem;
