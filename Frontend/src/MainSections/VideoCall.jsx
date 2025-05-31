import { useEffect, useRef, useState } from "react"
import {Mic,MicOff,Video,VideoOff,Phone,PhoneOff,MessageCircle,Send,X,Users,PhoneIncoming,Clock,} from "lucide-react"
import useSocket from "@/ZustandStore/SocketStore"

const VideoChat = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isInCall, setIsInCall] = useState(false)
  const [incomingCall, setIncomingCall] = useState(null)
  const [callTimeout, setCallTimeout] = useState(30)
  const [isCallExpiring, setIsCallExpiring] = useState(false)
  const [notification, setNotification] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const socket = useSocket((state) => state.socket)
  const socketId = useSocket((state) => state.socketId)

  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const peerConnection = useRef(null)
  const remoteIdRef = useRef(null)
  const localStreamRef = useRef(null)
  const chatEndRef = useRef(null)
  const ringtoneRef = useRef(null)
  const timeoutRef = useRef(null)
  const countdownRef = useRef(null)
  const isChatOpenRef = useRef(isChatOpen)

  const initializePeerConnection = () => {
    if (peerConnection.current) {
      peerConnection.current.close()
    }

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    })

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStreamRef.current)
      })
    }

    // Set up remote stream
    const remoteStream = new MediaStream()
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }

    peerConnection.current.ontrack = ({ streams: [stream] }) => {
      stream.getTracks().forEach((track) => {
        remoteStream.addTrack(track)
      })
    }

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && remoteIdRef.current && socket) {
        socket.emit("ice-candidate", {
          to: remoteIdRef.current,
          candidate: event.candidate,
        })
      }
    }

    peerConnection.current.onconnectionstatechange = () => {
      console.log("Connection state:", peerConnection.current?.connectionState)
      if (peerConnection.current?.connectionState === "failed") {
        // Reinitialize on failure
        initializePeerConnection()
      }
    }
  }

  useEffect(() => {
    if (!socket) return

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Initialize peer connection after getting media stream
        initializePeerConnection()
        setIsInitialized(true)

        socket.on("call-made", async ({ offer, socket: callerId }) => {
          console.log("call is incoming")
          setIncomingCall({ offer, callerId })
          setCallTimeout(30)
          setIsCallExpiring(false)

          if (ringtoneRef.current) {
            ringtoneRef.current.play().catch(console.error)
          }

          startCallTimeout(callerId)
        })

        socket.on("answer-made", async ({ answer }) => {
          if (peerConnection.current) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
            setIsInCall(true)
            clearCallTimeout()
          }
        })

        socket.on("ice-candidate", async ({ candidate }) => {
          if (candidate && peerConnection.current) {
            try {
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (error) {
              console.error("Error adding ICE candidate:", error)
            }
          }
        })

        socket.on("Recieve-peer2peer", ({ message, sender, timestamps, messageId }) => {
          console.log(message, sender, timestamps, messageId)
          setMessages((prev) => [...prev, { message, sender, type: "received", timestamps }])

          if (!isChatOpenRef.current) {
            setUnreadCount((prev) => prev + 1)
          } else {
            setUnreadCount(0)
          }
        })

        socket.on("call-declined", () => {
          setIncomingCall(null)
          clearCallTimeout()
          showNotification("Call was declined", "error")
        })

        socket.on("Call-expired", ({ reason, RejectedBy }) => {
          setIncomingCall(null)
          clearCallTimeout()
          showNotification(`Call expired: ${reason}`, "warning")
        })
      } catch (err) {
        console.error("Error accessing media devices.", err)
        showNotification("Failed to access camera/microphone", "error")
      }
    }

    start()

    return () => {
      clearCallTimeout()
      if (peerConnection.current) {
        peerConnection.current.close()
        peerConnection.current = null
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [socket])

  // Start call timeout countdown
  const startCallTimeout = (callerId) => {
    let timeLeft = 30
    setCallTimeout(timeLeft)

    countdownRef.current = setInterval(() => {
      timeLeft -= 1
      setCallTimeout(Math.max(0, timeLeft))

      if (timeLeft <= 10 && timeLeft > 0) {
        setIsCallExpiring(true)
      }

      if (timeLeft <= 0) {
        clearInterval(countdownRef.current)
        autoRejectCall(callerId)
      }
    }, 1000)

    timeoutRef.current = setTimeout(() => {
      autoRejectCall(callerId)
    }, 30000)
  }

  // Clear all timeouts
  const clearCallTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setCallTimeout(30)
    setIsCallExpiring(false)
  }

  // Auto-reject call when timeout expires
  const autoRejectCall = (callerId) => {
    if (!incomingCall) return

    socket.emit("Call-timeout", {
      reason: "No answer within 30 seconds",
      RejectedBy: socketId,
      RejectedOf: callerId,
    })

    setIncomingCall(null)
    clearCallTimeout()

    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleCall = async () => {
    if (!isInitialized || !peerConnection.current || !socket) {
      showNotification("Please wait for initialization to complete", "warning")
      return
    }

    const peerId = prompt("Enter the socket ID to call:")
    if (!peerId) return

    try {
      setRemoteSocketId(peerId)
      remoteIdRef.current = peerId

      // Ensure peer connection is in a good state
      if (peerConnection.current.signalingState === "closed") {
        initializePeerConnection()
      }

      const offer = await peerConnection.current.createOffer()
      await peerConnection.current.setLocalDescription(offer)

      socket.emit("call-user", { offer, to: peerId })
      console.log("calling the user")
      showNotification("Calling...", "info")
    } catch (error) {
      console.error("Error making call:", error)
      showNotification("Failed to make call. Please try again.", "error")

      // Reinitialize peer connection on error
      initializePeerConnection()
    }
  }

  const handleEndCall = () => {
    setIsInCall(false)
    setRemoteSocketId(null)
    remoteIdRef.current = null
    clearCallTimeout()

    // Reinitialize peer connection for next call
    initializePeerConnection()
  }

  // Enhanced accept call function
  const acceptCall = async () => {
    if (!incomingCall || !peerConnection.current) return

    const { offer, callerId } = incomingCall
    setRemoteSocketId(callerId)
    remoteIdRef.current = callerId
    setIncomingCall(null)
    clearCallTimeout()

    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }

    try {
      // Ensure peer connection is ready
      if (peerConnection.current.signalingState === "closed") {
        initializePeerConnection()
      }

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnection.current.createAnswer()
      await peerConnection.current.setLocalDescription(answer)

      socket.emit("make-answer", { answer, to: callerId })
      setIsInCall(true)
    } catch (error) {
      console.error("Error accepting call:", error)
      showNotification("Failed to accept call. Please try again.", "error")
      initializePeerConnection()
    }
  }

  // Enhanced decline call function
  const declineCall = () => {
    if (!incomingCall) return

    const { callerId } = incomingCall

    socket.emit("decline-call", { to: callerId })
    socket.emit("Call-timeout", {
      reason: "Call declined by user",
      RejectedBy: socketId,
      RejectedOf: callerId,
    })

    setIncomingCall(null)
    clearCallTimeout()

    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoMuted(!videoTrack.enabled)
      }
    }
  }

  const sendMessage = () => {
    if (newMessage.trim() && remoteSocketId && socket) {
      const messageData = {
        message: newMessage,
        sender: socketId,
        reciever: remoteSocketId,
        messageId: Date.now(),
        timestamps: new Date().toISOString(),
      }

      socket.emit("Send-peer2peer", messageData)
      setMessages((prev) => [
        ...prev,
        {
          message: newMessage,
          sender: "You",
          timestamp: messageData.timestamps,
          type: "sent",
        },
      ])
      setNewMessage("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const showNotification = (message, type = "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  useEffect(() => {
    isChatOpenRef.current = isChatOpen
    if (isChatOpen) {
      setUnreadCount(0)
    }
  }, [isChatOpen])

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-900 text-white">
      {/* Enhanced Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-sm w-full mx-4 text-center border border-gray-600 shadow-2xl">
            {/* Countdown Timer */}
            <div className="mb-4">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isCallExpiring ? "bg-red-600/20 text-red-400 animate-pulse" : "bg-blue-600/20 text-blue-400"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{callTimeout}s</span>
              </div>
            </div>

            {/* Enhanced Ringing Animation */}
            <div className="relative mb-6">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center relative shadow-lg">
                <PhoneIncoming className="w-14 h-14 text-white" />
                {/* Multiple Ripple Animations */}
                <div className="absolute inset-0 rounded-full border-4 border-green-400/60 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-400/40 animate-ping animation-delay-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-400/20 animate-ping animation-delay-400"></div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-white">Incoming Call</h3>
            <p className="text-gray-300 mb-2 font-medium">From:</p>
            <p className="text-blue-400 mb-6 font-mono text-sm break-all bg-gray-800/50 px-3 py-2 rounded-lg">
              {incomingCall.callerId}
            </p>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-6 justify-center">
              {/* Decline Button */}
              <button
                onClick={declineCall}
                className="group relative w-18 h-18 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-red-500/25"
              >
                <PhoneOff className="w-9 h-9 text-white group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-red-400/20 animate-pulse"></div>
              </button>

              {/* Accept Button */}
              <button
                onClick={acceptCall}
                className="group relative w-18 h-18 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-green-500/25 animate-pulse"
              >
                <Phone className="w-9 h-9 text-white group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse animation-delay-300"></div>
              </button>
            </div>

            {/* Call will expire warning */}
            {isCallExpiring && (
              <div className="mt-4 text-red-400 text-sm font-medium animate-pulse">Call will expire soon!</div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Audio Element for Ringtone */}
      <audio ref={ringtoneRef} loop>
        <source
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
          type="audio/wav"
        />
      </audio>

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col relative lg:h-screen">
        {/* Header */}
        <div className="bg-gray-800 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            <span className="font-mono break-all">ID: {socketId}</span>
            {!isInitialized && <span className="text-yellow-400 text-xs">(Initializing...)</span>}
          </div>
          {isInCall && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Connected
            </div>
          )}
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video */}
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-[90vh] object-cover scale-x-[-1]" />

          {/* Local Video - Responsive positioning */}
          <div className="absolute bottom-4 right-4 w-28 h-22 sm:w-32 sm:h-24 lg:w-40 lg:h-30 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            {isVideoMuted && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 sm:gap-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              {/* Audio Toggle */}
              <button
                onClick={toggleAudio}
                className={`p-2 sm:p-3 rounded-full transition-colors ${
                  isAudioMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {isAudioMuted ? (
                  <MicOff className="w-6 h-6 sm:w-5 sm:h-5" />
                ) : (
                  <Mic className="w-6 h-6 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Video Toggle */}
              <button
                onClick={toggleVideo}
                className={`p-2 sm:p-3 rounded-full transition-colors ${
                  isVideoMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {isVideoMuted ? (
                  <VideoOff className="w-6 h-6 sm:w-5 sm:h-5" />
                ) : (
                  <Video className="w-6 h-6 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Call/End Call */}
              {isInCall ? (
                <button
                  onClick={handleEndCall}
                  className="p-2 sm:p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <PhoneOff className="w-6 h-6 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button
                  onClick={handleCall}
                  disabled={!isInitialized}
                  className={`p-2 sm:p-3 rounded-full transition-colors ${
                    isInitialized ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Phone className="w-6 h-6 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Chat Toggle */}
              <button
                onClick={() => setIsChatOpen((prev) => !prev)}
                className={`p-2 sm:p-3 rounded-full transition-colors lg:hidden relative ${
                  isChatOpen ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`
    ${isChatOpen ? "flex" : "hidden"} lg:flex
    flex-col w-full lg:w-80 xl:w-96 bg-gray-800 border-l border-gray-700
    fixed lg:relative bottom-0 lg:bottom-auto right-0 lg:right-auto z-10 lg:z-auto
    h-[calc(100%-80px)] lg:h-full
    top-auto lg:top-0
  `}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat
            {/* Only show unread counter on mobile */}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center lg:hidden">
                {unreadCount}
              </span>
            )}
          </h3>
          <button onClick={() => setIsChatOpen(false)} className="lg:hidden p-1 hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">No messages yet. Start a conversation!</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-lg text-sm ${
                    msg.type === "sent" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <div className="font-medium text-xs opacity-75 mb-1">{msg.sender}</div>
                  <div>{msg.message}</div>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div
            className={`p-4 rounded-lg shadow-lg border-l-4 ${
              notification.type === "error"
                ? "bg-red-900/90 border-red-500 text-red-100"
                : notification.type === "warning"
                  ? "bg-yellow-900/90 border-yellow-500 text-yellow-100"
                  : "bg-blue-900/90 border-blue-500 text-blue-100"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="ml-3 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  )
}

export default VideoChat
