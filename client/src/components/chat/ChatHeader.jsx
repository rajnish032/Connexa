import React from "react";
import { Link } from "react-router";

const ChatHeader = ({
  activeTargetUser,
  onBackToSidebar,
  onStartCall, // (type: 'video' | 'audio') => void
  showInChatSearch,
  setShowInChatSearch,
  inChatSearchQuery,
  setInChatSearchQuery,
}) => {
  return (
    <div className="p-2.5 sm:px-6 border-b border-base-300 bg-base-100 flex items-center justify-between shadow-sm z-10 text-base-content min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Back button for mobile view */}
        <button
          onClick={onBackToSidebar}
          className="btn btn-ghost btn-xs btn-circle md:hidden text-base-content shrink-0"
          aria-label="Back to chat list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="avatar shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring ring-primary/30">
            <img
              src={
                activeTargetUser?.photoUrl ||
                "https://geographyandthemotive.org/wp-content/uploads/2018/04/dummy-user-img.png"
              }
              alt="Target User Avatar"
              onError={(e) => {
                e.target.src =
                  "https://geographyandthemotive.org/wp-content/uploads/2018/04/dummy-user-img.png";
              }}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm sm:text-base text-base-content leading-tight truncate">
            {activeTargetUser
              ? `${activeTargetUser.firstName} ${activeTargetUser.lastName}`
              : "Chat Partner"}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Online
          </p>
        </div>
      </div>

      {/* Header Actions & In-Chat Search */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {showInChatSearch ? (
          <div className="relative flex items-center animate-fade-in max-w-[120px] sm:max-w-none">
            <input
              type="text"
              placeholder="Search..."
              value={inChatSearchQuery}
              onChange={(e) => setInChatSearchQuery(e.target.value)}
              className="input input-xs input-bordered bg-base-100 text-base-content focus:outline-none focus:border-primary rounded-lg px-2 pr-6 text-xs w-full"
              autoFocus
            />
            <button
              onClick={() => {
                setShowInChatSearch(false);
                setInChatSearchQuery("");
              }}
              className="absolute right-1 text-base-content/50 hover:text-base-content text-xs p-1"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInChatSearch(true)}
            className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-base-content"
            title="Search in chat"
          >
            🔍
          </button>
        )}

        {/* Audio Call Trigger */}
        <button
          onClick={() => onStartCall("audio")}
          className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-primary"
          title="Start Audio Call"
        >
          📞
        </button>

        {/* Video Call Trigger */}
        <button
          onClick={() => onStartCall("video")}
          className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-primary text-base"
          title="Start Video Call"
        >
          📹
        </button>

        <Link
          to="/connections"
          className="btn btn-outline btn-xs border-base-300 text-base-content hidden sm:flex"
        >
          Profile
        </Link>
      </div>
    </div>
  );
};

export default ChatHeader;
