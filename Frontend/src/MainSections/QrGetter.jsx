import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { MessageCircle, Users, Send, Menu, X, ChevronLeft } from "lucide-react"
import useStore from "@/ZustandStore/UserStore"
import { useQuery } from "@tanstack/react-query"
import axios from 'axios'
import { useQueryClient } from "@tanstack/react-query"

function ChatApp() {

const queryClient = useQueryClient();

  const CurrentUser = useStore((state) => state.CurrentUser)
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [activeEvent, setActiveEvent] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("events")
  const [connectedUsers] = useState([])
  console.log(CurrentUser)

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const FetchData = async () => {
    const response = await axios.get("http://localhost:8000/event/active", {
      withCredentials: true,
    })
    return response.data.data
  }

  const { data } = useQuery({
    queryKey: ["ChatEvents"],
    queryFn: FetchData,
  })

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_BASE_URL || "http://localhost:8000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    })
    setSocket(socketInstance)
    return () => socketInstance.disconnect()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("connect", () => {
      setConnected(true)
    })

    socket.on("disconnect", () => {
      setConnected(false)
    })

    socket.on("Group-Message", (data) => {
        const newMessage = {
          id: data.MessageId,
          senderId: data.senderId || `user_${data.sender}`,
          senderName: data.sender,
          message: data.message,
          timestamp: Date.now(),
          group: data.group
        }
        
queryClient.setQueryData(['ChatEvents'], oldData => {
  console.log('oldData:', oldData);
  console.log('newMessage.group:', newMessage.group);

  if (!oldData) return oldData;

  let updated = false;

  const newData = oldData.map(group => {
    if (group._id === newMessage.group) {
      const exists = group.Messages.some(msg => msg.id === newMessage.id);
      if (!exists) {
        updated = true;
        return {
          ...group,
          Messages: [...group.Messages, newMessage]
        };
      }
    }
    return group;
  });

  console.log('updated:', updated);
  console.log('newData:', newData);

  return updated ? newData : oldData;
});
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    )

    socket.on("Group-Typing", (data) => {
      if (activeEvent && data.group === activeEvent._id && data.sender !== CurrentUser.name) {
        setIsTyping(true)
        setTypingUser(data.sender)

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
          setTypingUser("")
        }, 3000)
      }
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("Group-Typing")
      socket.off("Group-Message")
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [socket, activeEvent, CurrentUser])

  useEffect(() => {
    setMessages([])
    setIsTyping(false)
    setTypingUser("")
  }, [activeEvent])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!socket || !activeEvent || !message.trim()) return

    const MessageId = Date.now()
    const newMessage = {
      id: MessageId,
      senderId: CurrentUser._id,
      senderName: CurrentUser.name,
      message: message.trim(),
      group: activeEvent._id
    }
    console.log(newMessage)
    socket.emit("Send-group-Message", {
      group: newMessage.group,
      message: newMessage.message,
      sender: newMessage.senderName,
      senderId: newMessage.senderId,
      MessageId: newMessage.id,
    })

queryClient.setQueryData(['ChatEvents'], oldData => {
  if (!oldData) return oldData;
  let updated = false;
  const newData = oldData.map(group => {
    if (group._id === newMessage.group) {
      const exists = group.Messages.some(msg => msg.id === newMessage.id);
      if (!exists) {
        updated = true;
        return {
          ...group,
          Messages: [...group.Messages, newMessage]
        };
      }
    }
    return group;
  });
  return updated ? newData : oldData;
});
    setMessage('')
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)
    if (socket && activeEvent) {
      socket.emit("Is-Typing", {
        group: activeEvent._id,
        sender: CurrentUser.name,
        isTyping: true
      })
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-20 flex items-center p-4">
        <button onClick={() => setMobileSidebarOpen(true)} className="mr-4">
          <Menu className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold">{activeEvent ? activeEvent.title : "Event Chat"}</h1>
      </div>

      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-30 transform transition-transform duration-300 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 lg:block pt-16 lg:pt-0`}
      >
        <div className="lg:block">
          <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden absolute top-4 right-4">
            <X className="text-gray-600" />
          </button>

          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Event Chat</h1>
            <p className={`text-sm mt-1 ${connected ? "text-green-500" : "text-red-500"}`}>
              {connected ? "Connected" : "Disconnected"}
            </p>
            <p className="text-sm text-gray-500">Logged in as: {CurrentUser?.name || "Guest"}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 py-3 flex items-center justify-center ${
                activeTab === "events" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              <MessageCircle className="mr-2" size={18} /> Events
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 py-3 flex items-center justify-center ${
                activeTab === "participants" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              <Users className="mr-2" size={18} /> Participants
            </button>
          </div>

          {/* Events / Participants List */}
          <div className="p-4">
            {activeTab === "events" ? (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase">Available Events</h2>
                <div className="space-y-2">
                  {data?.map((event) => (
                    <button
                      key={event._id}
                      onClick={() => setActiveEvent(event)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeEvent?._id === event._id
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="font-medium"># {event.title}</div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>{formatDate(event.date)}</span>
                        <span>
                          {event.participantCount}{" "}
                          {event.participantCount === 1 ? "participant" : "participants"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                  Online Users ({connectedUsers.length})
                </h2>
                <div className="space-y-3">
                  {connectedUsers.map((user, index) => (
                    <div key={user.id || index} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {user.user.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.user}</p>
                        <p className="text-xs text-gray-500">{user.group ? `In: ${user.group}` : "Not in a group"}</p>
                      </div>
                    </div>
                  ))}
                  {connectedUsers.length === 0 && <p className="text-sm text-gray-500">No users connected</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white lg:rounded-l-3xl pt-16 lg:pt-0">
        {activeEvent && (
          <div className="p-4 border-b bg-white lg:rounded-tl-3xl flex items-center">
            <button className="lg:hidden mr-4">
              <ChevronLeft className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800"># {activeEvent.title}</h2>
              <p className="text-sm text-gray-500">
                {formatDate(activeEvent.date)} • {activeEvent.participantCount} participant
                {activeEvent.participantCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeEvent ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Select an event to start chatting</p>
            </div>
          ) : (
            <>


{data
  ?.find(group => group._id === activeEvent?._id)
  ?.Messages.map(msg => {
    const isUser = msg.senderId === CurrentUser?._id;
    return (
      <div
        key={msg.id}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-md px-4 py-2 rounded-2xl ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-gray-800 rounded-bl-none"
          }`}
        >
          {!isUser && (
            <div className="text-xs font-semibold mb-1">
              {msg.senderName}
            </div>
          )}
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
  })}
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
        {activeEvent && (
          <div className="p-4 border-t bg-white lg:rounded-bl-3xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder="Type a message…"
                className="flex-1 p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                disabled={!message.trim() || !connected}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatApp