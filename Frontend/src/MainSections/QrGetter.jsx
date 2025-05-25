import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { MessageCircle, Users, Send, Menu, X, ChevronLeft } from "lucide-react"
import useStore from "@/ZustandStore/UserStore"

function ChatApp() {
  const CurrentUser=useStore((state)=>state.CurrentUser)
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [connectedUsers, setConnectedUsers] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("events")

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    fetch("http://localhost:8000/event/active", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setEvents(data.data)
          if (data.data.length > 0 && !activeEvent) {
            setActiveEvent(data.data[0])
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching events:", err)
      })

    const socketInstance = io(import.meta.env.VITE_BASE_URL || "http://localhost:8000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("connect", () => {
      console.log("Connected to server")
      setConnected(true)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
      setConnected(false)
    })

    socket.on("connected-users", (users) => {
      setConnectedUsers(users)
      console.log(users)
    })
     socket.on("group-message", ({ senderName, senderId, message, timestamp }) => {
      const newMessage = {
        id: Date.now(),
        senderName,
        senderId,
        message,
        timestamp: timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
      // Scroll to bottom on new message
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    })

    socket.on('Group-Message',(data)=>{
      console.log("data:",data)
    })

    socket.on("Group-Typing", (data) => {
      console.log(data)
      setIsTyping(true)
      setTypingUser(data.sender)
      console.log('....')

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 3000)
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("connected-users")
      socket.off("group-message")
      socket.off("Group-Typing")
      socket.off("Group-Message")
    }
  }, [socket])

  useEffect(() => {
    if (socket && activeEvent) {
      socket.emit("leave-group")
      setMessages([])
      socket.emit("join-group", {
        group: activeEvent.title,
        eventId: activeEvent._id,
      })
    }
  }, [socket, activeEvent])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!socket || !activeEvent || !message.trim()) return;

    // Send message to server and let the server broadcast it back
    socket.emit("Send-group-Message", {
      group: activeEvent._id,
      message: message.trim(),
      sender:CurrentUser.name,
    })

    // Clear input field
    setMessage("")
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)

    if (socket && activeEvent) {
      socket.emit("Is-Typing", {
        group: activeEvent._id,
        sender:CurrentUser.name,
        isTyping:true
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
      {/* Sidebar Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-20 flex items-center p-4">
        <button onClick={() => setMobileSidebarOpen(true)} className="mr-4">
          <Menu className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold">{activeEvent ? activeEvent.title : "Event Chat"}</h1>
      </div>

      {/* Sidebar */}
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
                  {events.map((event) => (
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

      {/* Main Chat */}
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
              {messages.map((msg) => {
                const isUser = msg.senderId === CurrentUser?._id
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
                      {!isUser && <div className="text-xs font-semibold mb-1">{msg.senderName}</div>}
                      <p>{msg.message}</p>
                      <div className={`text-xs mt-1 flex justify-end ${isUser ? "text-blue-100" : "text-gray-500"}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                )
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
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="Type a message…"
                className="flex-1 p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                disabled={!message.trim() || !connected}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatApp
