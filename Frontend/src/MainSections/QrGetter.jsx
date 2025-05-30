import { useState, useEffect, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import {MessageCircle,Users,Send,Menu,X,Search,Trash2,Phone,Video, MoreHorizontal,Settings,} from "lucide-react"
import useStore from "@/ZustandStore/UserStore"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function useDebounce(callback, delay) {
  const timeoutRef = useRef(null)

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay],
  )
}

function ChatApp() {
  const queryClient = useQueryClient()
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
  const [searchQuery, setSearchQuery] = useState("")

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const Scroll2Button = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 50)
  }

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

  // Debounced typing function
  const debouncedTyping = useDebounce((eventId, userName) => {
    if (socket && eventId) {
      socket.emit("Is-Typing", {
        group: eventId,
        sender: userName,
        isTyping: true,
      })
    }
  }, 300)

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
        group: data.group,
      }

      queryClient.setQueryData(["ChatEvents"], (oldData) => {
        if (!oldData) return oldData
        let updated = false
        const newData = oldData.map((group) => {
          if (group._id === newMessage.group) {
            const exists = group.Messages.some((msg) => msg.id === newMessage.id)
            if (!exists) {
              updated = true
              return {
                ...group,
                Messages: [...group.Messages, newMessage],
              }
            }
          }
          return group
        })

        // Update activeEvent if it's the same group
        if (activeEvent && activeEvent._id === newMessage.group) {
          const updatedEvent = newData.find((group) => group._id === activeEvent._id)
          if (updatedEvent) {
            setActiveEvent(updatedEvent)
          }
        }

        return updated ? newData : oldData
      })
      Scroll2Button()
    })

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
      group: activeEvent._id,
    }

    socket.emit("Send-group-Message", {
      group: newMessage.group,
      message: newMessage.message,
      sender: newMessage.senderName,
      senderId: newMessage.senderId,
      MessageId: newMessage.id,
    })

    queryClient.setQueryData(["ChatEvents"], (oldData) => {
      if (!oldData) return oldData
      let updated = false
      const newData = oldData.map((group) => {
        if (group._id === newMessage.group) {
          const exists = group.Messages.some((msg) => msg.id === newMessage.id)
          if (!exists) {
            updated = true
            return {
              ...group,
              Messages: [...group.Messages, newMessage],
            }
          }
        }
        return group
      })
      return updated ? newData : oldData
    })
    Scroll2Button()
    setMessage("")
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)
    if (activeEvent && CurrentUser) {
      debouncedTyping(activeEvent._id, CurrentUser.name)
    }
  }

  const handleUnsendMessage = (messageId, groupId) => {

    if (socket) {
      // Update local state
      queryClient.setQueryData(["ChatEvents"], (oldData) => {
        if (!oldData) return oldData
        const newData = oldData.map((group) => {
          if (group._id === groupId) {
            return {
              ...group,
              Messages: group.Messages.filter((msg) => msg.id !== messageId),
            }
          }
          return group
        })
        return newData
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

  const filteredEvents = data?.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase())) || []

  // Get the initials for avatar
  const getInitials = (name) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  // Get a color based on name (for consistent avatar colors)
  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-300"
    const colors = [
      "bg-green-500",
      "bg-blue-500",
      "bg-orange-500",
      "bg-emerald-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-amber-600",
      "bg-yellow-500",
      "bg-teal-500",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Desktop & Mobile */}
        <div
          className={`${
            isMobileSidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-80 bg-white border-r border-gray-200 flex flex-col z-30`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                    3
                  </Badge>
                </div>
                <h1 className="text-lg font-semibold">
                  Inbox {filteredEvents.length > 0 && `(${filteredEvents.length})`}
                </h1>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Find a conversation"
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {filteredEvents.map((event) => {
              // Find the last message for this event
              const lastMessage =
                event.Messages && event.Messages.length > 0 ? event.Messages[event.Messages.length - 1] : null

              return (
                <div
                  key={event._id}
                  onClick={() => {
                    setActiveEvent(event)
                    if (window.innerWidth < 768) setMobileSidebarOpen(false)
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeEvent?._id === event._id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${getAvatarColor(event.title)} text-white font-medium`}>
                          {getInitials(event.title)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator would go here if needed */}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                        <span className="text-xs text-gray-500">
                          {lastMessage ? formatTime(lastMessage.timestamp) : formatDate(event.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {lastMessage
                          ? `${lastMessage.senderName === CurrentUser?.name ? "You: " : ""}${lastMessage.message}`
                          : `Created on ${formatDate(event.date)}`}
                      </p>
                    </div>

                    {/* Unread badge - you could calculate this based on read status */}
                    <Badge className="bg-blue-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center p-0">
                      3
                    </Badge>
                  </div>
                </div>
              )
            })}
          </ScrollArea>

          {/* Bottom Navigation - Mobile */}
          <div className="md:hidden border-t border-gray-200 p-2">
            <div className="flex justify-around">
              <Button variant="ghost" size="icon" className="text-blue-500">
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Mobile Header */}
          <div className="md:hidden p-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">{activeEvent ? activeEvent.title : "Chat"}</h1>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {activeEvent ? (
            <>
              {/* Chat Header - Desktop */}
              <div className="hidden md:flex p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={`${getAvatarColor(activeEvent.title)} text-white font-medium`}>
                        {getInitials(activeEvent.title)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-gray-900">{activeEvent.title}</h2>
                      <div className="flex items-center text-xs text-green-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Online
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-gray-500">
                      <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500">
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500">
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 bg-white">
                <div className="space-y-4 pb-4">
                  {data
                    ?.find((group) => group._id === activeEvent?._id)
                    ?.Messages?.map((msg) => {
                      const isUser = msg.senderId === CurrentUser?._id
                      return (
                        <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
                          <div
                            className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isUser ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {!isUser && (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className={`${getAvatarColor(msg.senderName)} text-white text-xs`}>
                                  {getInitials(msg.senderName)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              {!isUser && <div className="text-xs font-semibold mb-1">{msg.senderName}</div>}
                              <p className="text-sm">{msg.message}</p>
                              <div className={`text-xs mt-1 ${isUser ? "text-blue-100" : "text-gray-500"}`}>
                                {formatTime(msg.timestamp || Date.now())}
                              </div>
                            </div>

                            {/* Unsend option - only visible for user's own messages */}
                            {isUser && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="h-6 w-6 rounded-full"
                                      onClick={() => handleUnsendMessage(msg.id, activeEvent._id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Unsend message</TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`${getAvatarColor(typingUser)} text-white text-xs`}>
                            {getInitials(typingUser)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audio visualization (if needed) */}
                  {activeEvent.title === "Maria Fernanda" && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                        <div className="text-xs text-gray-500">02:03</div>
                        <div className="flex items-center h-6 gap-[1px]">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-green-500 w-1 rounded-full"
                              style={{
                                height: `${Math.sin(i * 0.5) * 12 + 6}px`,
                                opacity: i > 20 ? 0.3 : 1,
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      value={message}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="rounded-full border-gray-300"
                      disabled={!connected}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-blue-500 hover:bg-blue-600 h-10 w-10"
                    disabled={!message.trim() || !connected}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default ChatApp
