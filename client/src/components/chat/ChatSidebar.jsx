import React from "react";
import { Link } from "react-router";

const ChatSidebar = ({
  connections,
  loadingConnections,
  searchTerm,
  onSearchChange,
  targetUserId,
  onSelectConnection,
}) => {
  const filteredConnections = (connections || []).filter((conn) => {
    const fullName = `${conn.firstName || ""} ${conn.lastName || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div
      className={`w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-base-300 flex flex-col bg-base-200/50 text-base-content ${
        targetUserId ? "hidden md:flex" : "flex"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-base-300 flex flex-col gap-3 bg-base-100/80">
        <div className="flex justify-between items-center">
          <h2 className="font-extrabold text-xl text-base-content flex items-center gap-2">
            <span>💬</span> Chats
          </h2>
          <span className="badge badge-primary badge-sm font-semibold">
            {connections?.length || 0}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start new chat..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input input-sm input-bordered w-full pr-8 bg-base-100 text-base-content focus:outline-none focus:border-primary transition-all rounded-lg text-sm"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Connection List Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-base-300/40">
        {loadingConnections ? (
          <div className="flex justify-center items-center p-8">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : !connections || connections.length === 0 ? (
          <div className="p-8 text-center text-base-content/60">
            <p className="text-sm font-medium mb-1">No connections yet</p>
            <p className="text-xs text-base-content/50 mb-4">
              Connect with people in your feed to start messaging.
            </p>
            <Link to="/" className="btn btn-sm btn-primary">
              Explore Feed
            </Link>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="p-6 text-center text-xs text-base-content/50">
            No matching connections found.
          </div>
        ) : (
          filteredConnections.map((conn) => {
            const isSelected = conn._id === targetUserId;

            return (
              <div
                key={conn._id}
                onClick={() => onSelectConnection(conn._id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? "bg-primary/15 border-l-4 border-primary font-semibold"
                    : "hover:bg-base-200/80"
                }`}
              >
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full ring ring-primary/20">
                    <img
                      src={
                        conn.photoUrl ||
                        "https://geographyandthemotive.org/wp-content/uploads/2018/04/dummy-user-img.png"
                      }
                      alt={conn.firstName}
                      onError={(e) => {
                        e.target.src =
                          "https://geographyandthemotive.org/wp-content/uploads/2018/04/dummy-user-img.png";
                      }}
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-sm text-base-content truncate">
                      {conn.firstName} {conn.lastName}
                    </h3>
                  </div>
                  <p className="text-xs text-base-content/60 truncate mt-0.5">
                    {conn.about || "Click to open chat..."}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
