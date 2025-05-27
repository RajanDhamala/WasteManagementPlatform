import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useStore from "@/ZustandStore/UserStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Slidebar from "./Slidebar";
import ChatWindow from "./ChatWindow";

export default function ChatMain() {
  const CurrentUser = useStore((state) => state.CurrentUser);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("events");
  const [connectedUsers, setConnectedUsers] = useState([]);

  const messagesEndRef = useRef(null);

  // Fetch active events
  const { data: events } = useQuery({
    queryKey: ["allEvents"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8000/event/active", { withCredentials: true });
      return res.data.data || [];
    },
  });

  // Helper: format date for events
  const formatDate = (date) => new Date(date).toLocaleDateString();

  // Create socket only once when CurrentUser is ready
  useEffect(() => {
    if (!CurrentUser) return;

    const socketIo = io("http://localhost:8000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    setSocket(socketIo);

    socketIo.on("connect", () => setConnected(true));
    socketIo.on("disconnect", () => setConnected(false));

    // Update connected users list
    socketIo.on("Connected-Users", (users) => {
      setConnectedUsers(users);
    });

    // Clean up on unmount
    return () => {
      socketIo.disconnect();
    };
  }, [CurrentUser]);

  // Listen to messages and typing for activeEvent without reconnecting socket
  useEffect(() => {
    if (!socket || !activeEvent) return;

    // Reset messages and typing state on event change
    setMessages([]);
    setIsTyping(false);
    setTypingUser(null);

    // Handlers
    const handleGroupMessage = (data) => {
      if (data.group === activeEvent._id) {
        const newMsg = {
          id: data.MessageId,
          senderId: data.senderId,
          senderName: data.sender,
          message: data.message,
          timestamp: Date.now(),
          group: data.group,
        };
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      }
    };

    const handleGroupTyping = (data) => {
      if (data.group === activeEvent._id && data.sender !== CurrentUser.name) {
        setIsTyping(true);
        setTypingUser(data.sender);
        setTimeout(() => {
          setIsTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    };

    socket.on("Group-Message", handleGroupMessage);
    socket.on("Group-Typing", handleGroupTyping);

    // Cleanup old listeners on activeEvent change or socket disconnect
    return () => {
      socket.off("Group-Message", handleGroupMessage);
      socket.off("Group-Typing", handleGroupTyping);
    };
  }, [socket, activeEvent, CurrentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (message) => {
    if (!socket || !activeEvent || !message.trim()) return;

    const MessageId = Date.now();
    const newMessage = {
      id: MessageId,
      senderId: CurrentUser._id,
      senderName: CurrentUser.name,
      message: message.trim(),
      group: activeEvent._id,
      timestamp: Date.now(),
    };

    socket.emit("Send-group-Message", {
      group: newMessage.group,
      message: newMessage.message,
      sender: newMessage.senderName,
      senderId: newMessage.senderId,
      MessageId: newMessage.id,
    });

    setMessages((prev) => {
      if (prev.find((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });

    scrollToBottom();
  };

  const handleTyping = () => {
    if (socket && activeEvent) {
      socket.emit("Is-Typing", {
        group: activeEvent._id,
        sender: CurrentUser.name,
        isTyping: true,
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Slidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        connected={connected}
        CurrentUser={CurrentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        events={events}
        activeEvent={activeEvent}
        setActiveEvent={setActiveEvent}
        connectedUsers={connectedUsers}
        formatDate={formatDate}
      />
      <ChatWindow
        messages={messages}
        activeEvent={activeEvent}
        currentUser={CurrentUser}
        isTyping={isTyping}
        typingUser={typingUser}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
