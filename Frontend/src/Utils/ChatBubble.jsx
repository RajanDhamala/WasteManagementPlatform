import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { decryptMessage } from "./MessageUtil";
import React,{memo} from "react";
import { getInitials,getAvatarColor,formatDate,formatTime } from "./MessageUtil";

function ChatBubble({
  msg,
  publicKey,
  isUser,
  activeChat,
  CurrentUser,
  handleUnsendMessage,
  handleEditMessage,
  myPrivateKey,
}) {
  const [decryptedText, setDecryptedText] = useState("[decrypting...]");


  useEffect(() => {
    let mounted = true;

    // If this message is sent by current user, no need to decrypt — use message as-is
    if (isUser) {
      setDecryptedText(msg.message);
      return;
    }

    (async () => {
      try {
        console.log("trial", msg);
        const plaintext = await decryptMessage(
          msg.message, // encrypted text
          publicKey, // sender's public key
          myPrivateKey
        );

        if (mounted) setDecryptedText(plaintext);
      } catch (err) {
        console.error("Decryption failed:", err);
        if (mounted) setDecryptedText("[decryption error]");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [msg, myPrivateKey, isUser, publicKey]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isUser && (
          <Avatar className="w-8 h-8">
            <AvatarFallback
              className={`${getAvatarColor(msg.senderName)} text-white text-xs`}
            >
              {getInitials(msg.senderName)}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`px-4 py-2 rounded-2xl relative ${
            isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          {/* Sender Name for group chat */}
          {!isUser && activeChat.type === "group" && (
            <div className="text-xs font-semibold mb-1">{msg.senderName}</div>
          )}

          {/* Message */}
       <p
        className="text-sm break-words whitespace-pre-wrap pr-2"
        style={{
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {decryptedText}
      </p>

          <div
            className={`text-xs mt-1 flex items-center justify-between ${
              isUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <span>{formatTime(msg.timestamp || Date.now())}</span>
            {msg?.isEdited && (
              <span className="ml-2 text-[10px] italic">(edited)</span>
            )}
          </div>

          {/* Three-dot menu */}
          {isUser && (
            <div className="absolute top-1 right-1 pl-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditMessage(msg)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUnsendMessage(msg.id)}>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ChatBubble)