import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle,Users,Send,Menu,X,Search,Trash2,Phone,Video,MoreHorizontal,Settings,UserPlus,Circle,CheckCircle2,} from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useSocket from "@/ZustandStore/SocketStore"
import { useNavigate } from "react-router-dom"

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
  const navigate=useNavigate()
  const queryClient = useQueryClient()
  const CurrentUser = useStore((state) => state.CurrentUser)
  const [activeChat, setActiveChat] = useState(null)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("groups")
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadCounts, setUnreadCounts] = useState({})

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const socket = useSocket((state) => state.socket)
  const setVideoCall = useSocket((state) => state.setVideoCall)
  const VideoCall = useSocket((state) => state.VideoCall)

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

  const FetchDirectChats = async () => {
    try {
     const response = await new Promise(async (resolve, reject) => {
    try {
      const res = await axios.get("http://localhost:8000/user/current", {
        withCredentials: true,
      })
      setTimeout(() => {
        resolve(res)
      }, 2000) 
    } catch (err) {
      reject(err)
    }
  })
      console.log("Raw API response:", response.data.data)

      const transformedData = (response.data.data || []).map((user) => ({
        _id: user.id,
        title: user.user,
        Messages: [],
        type: "direct",
        date: new Date().toISOString(),
        isOnline: true,
      }))

      console.log("Transformed direct chats:", transformedData)
      return transformedData
    } catch (error) {
      console.error("Error fetching direct chats:", error)
      return []
    }
  }

  const { data: groupData } = useQuery({
    queryKey: ["ChatEvents"],
    queryFn: FetchData,
  })

  const { data: directData, refetch: refetchDirectChats } = useQuery({
    queryKey: ["DirectChats"],
    queryFn: FetchDirectChats,
  })

  const handleVideoCalling = (receiverId,name) => {
    setVideoCall({
      receiverId: receiverId,
      isActive: true,
      callType: "video",
      reciverName:name,
    })
    console.log(receiverId,name)
   navigate(`/call`)
  }

  const debouncedTyping = useDebounce((chatId, userName, isGroup) => {
    if (socket && chatId) {
      if (isGroup) {
        socket.emit("Is-Typing", {
          group: chatId,
          sender: userName,
          isTyping: true,
        })
      } else {
        socket.emit("Direct-Typing", {
          chatId: chatId,
          sender: userName,
          isTyping: true,
        })
      }
    }
  }, 300)

  useEffect(() => {
    if (!socket) return
    socket.on("Group-Message", (data) => {
      const newMessage = {
        id: data.MessageId,
        senderId: data.senderId || `user_${data.sender}`,
        senderName: data.sender,
        message: data.message,
        timestamp: Date.now(),
        group: data.group,
        readBy: data.readBy || [],
      }
      console.log("Received group message:", data)

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

        // Update activeChat if it's the same group
        if (activeChat && activeChat._id === newMessage.group && activeChat.type === "group") {
          const updatedEvent = newData.find((group) => group._id === activeChat._id)
          if (updatedEvent) {
            setActiveChat({ ...updatedEvent, type: "group" })
          }
        } else {
          // Update unread count if not in active chat
          setUnreadCounts((prev) => ({
            ...prev,
            [newMessage.group]: (prev[newMessage.group] || 0) + 1,
          }))
        }

        return updated ? newData : oldData
      })
      Scroll2Button()
    })

    // Direct message handling
    socket.on("Recieve-peer2peer", ({ message, sender, timestamps, messageId, chatId, senderId }) => {
      const newMessage = {
        id: messageId,
        senderId: senderId || `user_${sender}`,
        senderName: sender,
        message: message,
        timestamp: timestamps || Date.now(),
      }
      console.log("Received direct message:", newMessage)

      queryClient.setQueryData(["DirectChats"], (oldData) => {
        if (!oldData) return oldData
        let updated = false
        const newData = oldData.map((chat) => {
          // Match by chatId (receiver ID) or sender name for direct chats
          if (chat._id === chatId || chat.title === sender) {
            const exists = chat.Messages?.some((msg) => msg.id === newMessage.id)
            if (!exists) {
              updated = true
              return {
                ...chat,
                Messages: [...(chat.Messages || []), newMessage],
              }
            }
          }
          return chat
        })

        // Update activeChat if it's the same direct chat
        if (activeChat && (activeChat._id === chatId || activeChat.title === sender) && activeChat.type === "direct") {
          const updatedChat = newData.find((chat) => chat._id === activeChat._id || chat.title === sender)
          if (updatedChat) {
            setActiveChat({ ...updatedChat, type: "direct" })
          }
        } else {
          // Update unread count if not in active chat
          const targetChatId = chatId || newData.find((chat) => chat.title === sender)?._id
          if (targetChatId) {
            setUnreadCounts((prev) => ({
              ...prev,
              [targetChatId]: (prev[targetChatId] || 0) + 1,
            }))
          }
        }

        return updated ? newData : oldData
      })
      Scroll2Button()
    })

    // Group typing
    socket.on("Group-Typing", (data) => {
      if (
        activeChat &&
        data.group === activeChat._id &&
        data.sender !== CurrentUser.name &&
        activeChat.type === "group"
      ) {
        setIsTyping(true)
        setTypingUser(data.sender)

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
          setTypingUser("")
        }, 3000)
      }
    })

    // Direct typing
    socket.on("Direct-Typing", (data) => {
      if (
        activeChat &&
        data.chatId === activeChat._id &&
        data.sender !== CurrentUser.name &&
        activeChat.type === "direct"
      ) {
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
      socket.off("Direct-Typing")
      socket.off("Group-Message")
      socket.off("Recieve-peer2peer")
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [socket, activeChat, CurrentUser])

  useEffect(() => {
    setIsTyping(false)
    setTypingUser("")

    // Mark messages as read when opening a chat
    if (activeChat) {
      setUnreadCounts((prev) => ({
        ...prev,
        [activeChat._id]: 0,
      }))
    }
  }, [activeChat])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!socket || !activeChat || !message.trim()) return

    const MessageId = Date.now()
    const newMessage = {
      id: MessageId,
      senderId: CurrentUser._id,
      senderName: CurrentUser.name,
      message: message.trim(),
      timestamp: Date.now(),
    }

    if (activeChat.type === "group") {
      // Send the socket message
      socket.emit("Send-group-Message", {
        group: activeChat._id,
        message: newMessage.message,
        sender: newMessage.senderName,
        senderId: newMessage.senderId,
        MessageId: Date.now(),
      })

      // Update React Query cache
      queryClient.setQueryData(["ChatEvents"], (oldData) => {
        if (!oldData) return oldData
        let updated = false
        const newData = oldData.map((group) => {
          if (group._id === activeChat._id) {
            const exists = group.Messages.some((msg) => msg.id === newMessage.id)
            if (!exists) {
              updated = true
              return {
                ...group,
                Messages: [...group.Messages, { ...newMessage, group: activeChat._id }],
              }
            }
          }
          return group
        })
        return updated ? newData : oldData
      })

      // Update activeChat state immediately
      setActiveChat((prevActiveChat) => ({
        ...prevActiveChat,
        Messages: [...(prevActiveChat.Messages || []), { ...newMessage, group: activeChat._id }],
      }))
    } else {
      // Send the socket message for direct chat
      console.log("peer 2peer msg sent",newMessage.message)
      socket.emit("Send-peer2peer", {
        messageId: MessageId,
        message: newMessage.message,
        sender: newMessage.senderName,
        senderId: newMessage.senderId,
        reciever: activeChat.title, // Use the chat ID as receiver
        timestamps: newMessage.timestamp,
      })

      // Update React Query cache immediately for sender
      queryClient.setQueryData(["DirectChats"], (oldData) => {
        if (!oldData) return oldData
        let updated = false
        const newData = oldData.map((chat) => {
          if (chat._id === activeChat._id) {
            const exists = chat.Messages?.some((msg) => msg.id === newMessage.id)
            if (!exists) {
              updated = true
              return {
                ...chat,
                Messages: [...(chat.Messages || []), newMessage],
              }
            }
          }
          return chat
        })
        return updated ? newData : oldData
      })

      // Update activeChat state immediately
      setActiveChat((prevActiveChat) => ({
        ...prevActiveChat,
        Messages: [...(prevActiveChat.Messages || []), newMessage],
      }))
    }

    Scroll2Button()
    setMessage("")
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)
    if (activeChat && CurrentUser) {
      debouncedTyping(activeChat._id, CurrentUser.name, activeChat.type === "group")
    }
  }

  const handleUnsendMessage = (messageId) => {
    if (activeChat.type === "group") {
      if (socket) {
        // Update React Query cache
        queryClient.setQueryData(["ChatEvents"], (oldData) => {
          if (!oldData) return oldData
          const newData = oldData.map((group) => {
            if (group._id === activeChat._id) {
              return {
                ...group,
                Messages: group.Messages.filter((msg) => msg.id !== messageId),
              }
            }
            return group
          })
          return newData
        })

        // Update activeChat state immediately
        setActiveChat((prevActiveChat) => ({
          ...prevActiveChat,
          Messages: prevActiveChat.Messages.filter((msg) => msg.id !== messageId),
        }))
      }
    } else {
      if (socket) {
        // Update React Query cache
        queryClient.setQueryData(["DirectChats"], (oldData) => {
          if (!oldData) return oldData
          const newData = oldData.map((chat) => {
            if (chat._id === activeChat._id) {
              return {
                ...chat,
                Messages: (chat.Messages || []).filter((msg) => msg.id !== messageId),
              }
            }
            return chat
          })
          return newData
        })

        // Update activeChat state immediately
        setActiveChat((prevActiveChat) => ({
          ...prevActiveChat,
          Messages: (prevActiveChat.Messages || []).filter((msg) => msg.id !== messageId),
        }))
      }
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

  const getInitials = (name) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

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

  const getCurrentChats = () => {
    if (activeTab === "groups") {
      return (groupData || [])
        .filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((event) => ({ ...event, type: "group" }))
    } else {
      // Filter out current user from direct chats
      return (directData || [])
        .filter((chat) => chat.title !== CurrentUser?.name) // Don't show yourself in direct chats
        .filter((chat) => chat.title?.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((chat) => ({ ...chat, type: "direct" }))
    }
  }

  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
  }

  const getTabUnreadCount = (tab) => {
    const chats = tab === "groups" ? groupData || [] : directData || []
    return chats.reduce((sum, chat) => sum + (unreadCounts[chat._id] || 0), 0)
  }

  const currentChats = getCurrentChats()
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-50 md:ml-14">
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
                  {getTotalUnreadCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                      {getTotalUnreadCount()}
                    </Badge>
                  )}
                </div>
                <h1 className="text-lg font-semibold">Messages</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => refetchDirectChats()}>
                  <UserPlus className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations"
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="groups" className="relative">
                  <Users className="w-4 h-4 mr-2" />
                  Groups ({(groupData || []).length})
                  {getTabUnreadCount("groups") > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                      {getTabUnreadCount("groups")}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="direct" className="relative">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Direct ({(directData || []).filter((chat) => chat.title !== CurrentUser?.name).length})
                  {getTabUnreadCount("direct") > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                      {getTabUnreadCount("direct")}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {currentChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {activeTab === "groups" ? "No groups available" : "No users online"}
              </div>
            ) : (
              currentChats.map((chat) => {
                const lastMessage =
                  chat.Messages && chat.Messages.length > 0 ? chat.Messages[chat.Messages.length - 1] : null
                const unreadCount = unreadCounts[chat._id] || 0

                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setActiveChat(chat)
                      if (window.innerWidth < 768) setMobileSidebarOpen(false)
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {lastMessage ? formatTime(lastMessage.timestamp) : formatDate(chat.date)}
                            </span>
                            {lastMessage && lastMessage.senderId === CurrentUser._id && (
                              <div className="text-blue-500">
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {lastMessage
                            ? `${lastMessage.senderName === CurrentUser?.name ? "You: " : ""}${lastMessage.message}`
                            : chat.type === "direct"
                              ? "Start a conversation"
                              : `Created on ${formatDate(chat.date)}`}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center p-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </ScrollArea>

        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Mobile Header */}
          <div className="md:hidden p-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">{activeChat ? activeChat.title : "Chat"}</h1>
            <div className="flex items-center space-x-2">
              {activeChat?.type === "direct" && (
                <>
                  <Button variant="ghost" size="icon">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" >
                    <Video className="w-5 h-5" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {activeChat ? (
            <>
              {/* Chat Header - Desktop */}
              <div className="hidden md:flex p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${getAvatarColor(activeChat.title)} text-white font-medium`}>
                          {activeChat.type === "group" ? <Users className="w-5 h-5" /> : getInitials(activeChat.title)}
                        </AvatarFallback>
                      </Avatar>
                      {activeChat.type === "direct" && (
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            activeChat.isOnline ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{activeChat.title}</h2>
                      <div className="flex items-center text-xs text-gray-500">
                        {activeChat.type === "group" ? (
                          <span>{activeChat.participantCount || 0} members</span>
                        ) : (
                          <span className={activeChat.isOnline ? "text-green-500" : "text-gray-500"}>
                            {activeChat.isOnline ? "Online" : "Offline"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-gray-500">
                      <Search className="w-5 h-5" />
                    </Button>
                    {activeChat.type === "direct" && (
                      <>
                        <Button variant="ghost" size="icon" className="text-gray-500">
                          <Phone className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500"
                         onClick={() => handleVideoCalling(activeChat._id,activeChat.title)}
                        >
                          <Video className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="text-gray-500">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 bg-white">
                <div className="space-y-4 pb-4">
                  {activeChat.Messages?.map((msg) => {
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
                            {!isUser && activeChat.type === "group" && (
                              <div className="text-xs font-semibold mb-1">{msg.senderName}</div>
                            )}
                            <p className="text-sm">{msg.message}</p>
                            <div
                              className={`text-xs mt-1 flex items-center justify-between ${
                                isUser ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              <span>{formatTime(msg.timestamp || Date.now())}</span>
                            </div>
                          </div>

                          {isUser && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => handleUnsendMessage(msg.id)}
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

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      value={message}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="rounded-full border-gray-300"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-blue-500 hover:bg-blue-600 h-10 w-10"
                    disabled={!message.trim()}
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
