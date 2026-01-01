import { MessageCircle, Users, X } from "lucide-react";

export default function Slidebar({
  isMobileSidebarOpen,
  setMobileSidebarOpen,
  connected,
  CurrentUser,
  activeTab,
  setActiveTab,
  events = [],
  activeEvent,
  setActiveEvent,
  connectedUsers = [],
  formatDate,
}) {
  return (
    <div
      className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-30 transform transition-transform duration-300 ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0 lg:block pt-16 lg:pt-0`}
    >
      <div className="lg:block">
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4"
        >
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
              activeTab === "events"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            <MessageCircle className="mr-2" size={18} /> Events
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`flex-1 py-3 flex items-center justify-center ${
              activeTab === "participants"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            <Users className="mr-2" size={18} /> Participants
          </button>
        </div>

        {/* Events / Participants List */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
          {activeTab === "events" ? (
            <>
              <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                Available Events
              </h2>
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
            </>
          ) : (
            <>
              <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                Online Users ({connectedUsers.length})
              </h2>
              <div className="space-y-3">
                {connectedUsers.length > 0 ? (
                  connectedUsers.map((user, index) => (
                    <div key={user.id || index} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {user.user.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.user}</p>
                        <p className="text-xs text-gray-500">
                          {user.group ? `In: ${user.group}` : "Not in a group"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No users connected</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
