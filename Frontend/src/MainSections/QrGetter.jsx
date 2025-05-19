import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import { 
  SendIcon, 
  MenuIcon, 
  XIcon, 
  MessageCircleIcon, 
  UsersIcon, 
  ChevronLeftIcon 
} from "lucide-react"

function ImprovedChatApp() {
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")
  const [groupName, setGroupName] = useState("")
  const [message, setMessage] = useState("")
  const [groupMessages, setGroupMessages] = useState([])
  const [groups] = useState([
    "General", 
    "Random", 
    "Tech Talk", 
    "Support"
  ])
  const [participants] = useState([
    { id: 1, name: "Alice Johnson", online: true, avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=1" },
    { id: 2, name: "Bob Smith", online: true, avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=2" },
    { id: 3, name: "Charlie Brown", online: false, avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=3" }
  ])
  
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("groups")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const socket = io("http://localhost:8000", {
      withCredentials: true,
      transports: ["websocket", "polling"]
    })

    socketRef.current = socket

    socket.on("connect", () => setConnectionStatus("Connected"))
    socket.on("disconnect", () => setConnectionStatus("Disconnected"))
    
    socket.on("group-message", (data) => {
      const receivedMsg = {
        sender: data.sender || "Anonymous",
        message: data.message,
        timestamp: new Date().toISOString(),
        isUser: false
      }
      setGroupMessages(prev => [...prev, receivedMsg])
      setIsTyping(false)
    })

    socket.on("typing", () => {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
    })

    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [groupMessages])

  const handleJoinGroup = (name) => {
    if (name.trim() === "") return
    setGroupName(name)
    setGroupMessages([]) // Clear messages when switching groups
    socketRef.current.emit("join-group", name)
    setMobileSidebarOpen(false)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!groupName || message.trim() === "") return

    const newMessage = {
      sender: "You",
      message,
      timestamp: new Date().toISOString(),
      isUser: true
    }

    setGroupMessages(prev => [...prev, newMessage])
    socketRef.current.emit("send-group-message", { group: groupName, message })
    setMessage("")
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden md:ml-14">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-20 flex items-center p-4">
        <button onClick={() => setMobileSidebarOpen(true)} className="mr-4">
          <MenuIcon className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold">Chat App</h1>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-30 
        transform transition-transform duration-300
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:block
        pt-16 lg:pt-0
      `}>
        <div className="lg:block">
          <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden absolute top-4 right-4">
            <XIcon className="text-gray-600" />
          </button>

          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Chat App</h1>
            <p className={`text-sm mt-1 ${connectionStatus === "Connected" ? "text-green-500" : "text-red-500"}`}>
              {connectionStatus}
            </p>
          </div>

          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab("groups")}
              className={`flex-1 py-3 flex items-center justify-center ${
                activeTab === "groups" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              <MessageCircleIcon className="mr-2" /> Groups
            </button>
            <button 
              onClick={() => setActiveTab("participants")}
              className={`flex-1 py-3 flex items-center justify-center ${
                activeTab === "participants" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              <UsersIcon className="mr-2" /> Participants
            </button>
          </div>

          <div className="p-4">
            {activeTab === "groups" ? (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase">Available Groups</h2>
                <div className="space-y-2">
                  {groups.map((group) => (
                    <button 
                      key={group}
                      onClick={() => handleJoinGroup(group)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        groupName === group ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      # {group}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase">Online Participants</h2>
                <div className="space-y-3">
                  {participants.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white" />
                        <span 
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            user.online ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white lg:rounded-l-3xl pt-16 lg:pt-0">
        <div className="p-4 border-b bg-white lg:rounded-tl-3xl flex items-center">
          <button onClick={() => setGroupName("")} className="lg:hidden mr-4">
            <ChevronLeftIcon className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {groupName ? `# ${groupName}` : "Select a Group"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!groupName ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <MessageCircleIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Select a group to start chatting</p>
            </div>
          ) : (
            <>
              {groupMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`
                    max-w-md px-4 py-2 rounded-2xl 
                    ${msg.isUser 
                      ? "bg-blue-500 text-white rounded-br-none" 
                      : "bg-gray-200 text-gray-800 rounded-bl-none"}
                  `}>
                    <p>{msg.message}</p>
                    <div className={`text-xs mt-1 flex justify-end ${
                      msg.isUser ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      {[1, 2, 3].map(dot => (
                        <div key={dot} className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {groupName && (
          <div className="p-4 border-t bg-white lg:rounded-bl-3xl">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors">
                <SendIcon />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImprovedChatApp
