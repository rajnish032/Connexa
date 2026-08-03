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
    <div className="p-3 px-6 border-b border-base-300 bg-base-100 flex items-center justify-between shadow-sm z-10 text-base-content">
      <div className="flex items-center gap-3">
        {/* Back button for mobile view */}
        <button
          onClick={onBackToSidebar}
          className="btn btn-ghost btn-xs btn-circle md:hidden text-base-content"
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

        <div className="avatar">
          <div className="w-10 h-10 rounded-full ring ring-primary/30">
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

        <div>
          <h3 className="font-bold text-base text-base-content leading-tight">
            {activeTargetUser
              ? `${activeTargetUser.firstName} ${activeTargetUser.lastName}`
              : "Chat Partner"}
          </h3>
          <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Online
          </p>
        </div>
      </div>

      {/* Header Actions & In-Chat Search */}
      <div className="flex items-center gap-2">
        {showInChatSearch ? (
          <div className="relative flex items-center animate-fade-in">
            <input
              type="text"
              placeholder="Search in chat..."
              value={inChatSearchQuery}
              onChange={(e) => setInChatSearchQuery(e.target.value)}
              className="input input-xs input-bordered bg-base-100 text-base-content focus:outline-none focus:border-primary rounded-lg px-2 pr-7 text-xs"
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
          className="btn btn-outline btn-xs gap-1 border-base-300 text-base-content ml-1"
        >
          Profile
        </Link>
      </div>
    </div>
  );
};

export default ChatHeader;
