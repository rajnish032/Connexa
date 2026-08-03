import React from "react";

const ALL_EMOJIS = [
  "👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉", "😍", "🥳", 
  "👏", "💯", "🚀", "🤔", "👀", "🙌", "😎", "💩", "✨", "🤝"
];

const MessageBubble = ({
  msg,
  userId,
  userFirstName,
  activeReactMsgId,
  setActiveReactMsgId,
  doubleClickMsgId,
  setDoubleClickMsgId,
  showMenuEmojiPicker,
  setShowMenuEmojiPicker,
  onReact,
  onInitiateReply,
  onCopyText,
  onDeleteMessage,
}) => {
  const isCurrentUser =
    userFirstName === msg.firstName ||
    (msg.senderId && msg.senderId === userId);

  const isReactActive = activeReactMsgId === msg._id;
  const isDoubleClickActive = doubleClickMsgId === msg._id;

  return (
    <div
      className={`chat group relative ${
        isCurrentUser ? "chat-end" : "chat-start"
      }`}
    >
      <div className="chat-header text-[11px] opacity-75 mb-1 font-medium text-base-content flex items-center gap-2">
        <span>{isCurrentUser ? "You" : `${msg.firstName || ""}`}</span>
      </div>

      {/* Interactive Message Container with WHATSAPP HOVER ACTIONS */}
      <div className="flex items-center gap-1.5 group/msg relative">
        
        {/* LEFT HOVER ACTION: React Icon button */}
        {!msg.isDeleted && (
          <div className="relative opacity-0 group-hover/msg:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveReactMsgId(isReactActive ? null : msg._id);
              }}
              className="btn btn-ghost btn-circle btn-xs text-base-content/70 hover:bg-base-200"
              title="React with emoji"
            >
              😀
            </button>

            {/* HOVER EMOJI REACTION POPPER */}
            {isReactActive && (
              <div className="absolute bottom-8 left-0 z-40 bg-base-100/95 backdrop-blur-md border border-base-300 p-2 rounded-2xl shadow-2xl flex flex-wrap gap-1.5 w-56 animate-fade-in text-base text-base-content">
                {ALL_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact(msg._id, emoji);
                    }}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAIN BUBBLE (Theme-aware for Light & Dark mode) */}
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (!msg.isDeleted) {
              setDoubleClickMsgId(isDoubleClickActive ? null : msg._id);
              setShowMenuEmojiPicker(false);
            }
          }}
          className={`chat-bubble text-sm max-w-[88%] sm:max-w-md md:max-w-lg leading-relaxed shadow-sm relative cursor-pointer transition-all ${
            isCurrentUser
              ? "bg-primary text-primary-content rounded-tr-none"
              : "bg-base-200 text-base-content border border-base-300 rounded-tl-none"
          } ${msg.isDeleted ? "italic opacity-60" : ""}`}
        >
          {/* FLOATING CONTEXT MENU ON DOUBLE CLICK (100% VISIBLE ON SCREEN) */}
          {isDoubleClickActive && !msg.isDeleted && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute z-50 top-full mt-1.5 ${
                isCurrentUser ? "right-0" : "left-0"
              } bg-base-100 border border-base-300 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 w-48 animate-fade-in text-xs font-semibold text-base-content`}
            >
              {/* Option 1: Reply */}
              <button
                type="button"
                onClick={() => onInitiateReply(msg)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-base-200 text-left"
              >
                <span>↩️</span> Reply
              </button>

              {/* Option 2: React (Clicking expands all emojis) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenuEmojiPicker(!showMenuEmojiPicker)}
                  className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-base-200 text-left"
                >
                  <span className="flex items-center gap-2">
                    <span>😀</span> React
                  </span>
                  <span>{showMenuEmojiPicker ? "▲" : "▼"}</span>
                </button>

                {/* Expanded Emoji Palette */}
                {showMenuEmojiPicker && (
                  <div className="p-2 border-t border-base-200 grid grid-cols-5 gap-1.5 text-base mt-1">
                    {ALL_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => onReact(msg._id, emoji)}
                        className="hover:scale-125 transition-transform text-center p-0.5"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Option 3: Copy */}
              {msg.text && (
                <button
                  type="button"
                  onClick={() => onCopyText(msg.text)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-base-200 text-left"
                >
                  <span>📋</span> Copy Text
                </button>
              )}

              {/* Option 4: Delete */}
              {isCurrentUser && (
                <button
                  type="button"
                  onClick={() => onDeleteMessage(msg._id)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-error/20 text-error text-left"
                >
                  <span>🗑️</span> Delete
                </button>
              )}
            </div>
          )}

          {/* Quoted Reply Preview */}
          {msg.replyTo && (
            <div className="mb-2 p-2 rounded-lg bg-base-100/20 border-l-4 border-secondary text-xs opacity-90">
              <span className="font-bold block text-secondary">
                {msg.replyTo.senderName}
              </span>
              <span className="truncate block opacity-90">
                {msg.replyTo.text || `[${msg.replyTo.mediaType || "Media"}]`}
              </span>
            </div>
          )}

          {/* Media Contents */}
          {!msg.isDeleted && msg.mediaUrl && (
            <div className="mb-2 overflow-hidden rounded-xl">
              {(msg.mediaType === "image" || msg.mediaType === "gif") && (
                <img
                  src={msg.mediaUrl}
                  alt="Attachment"
                  className="max-h-60 rounded-xl object-cover"
                />
              )}
              {msg.mediaType === "video" && (
                <video
                  src={msg.mediaUrl}
                  controls
                  className="max-h-60 rounded-xl w-full"
                />
              )}
              {msg.mediaType === "audio" && (
                <audio src={msg.mediaUrl} controls className="w-full mt-1" />
              )}
              {msg.mediaType === "document" && (
                <a
                  href={msg.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-base-100/30 hover:bg-base-100/50 transition-colors"
                >
                  <span className="text-2xl">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs truncate">
                      {msg.fileName || "Download Document"}
                    </p>
                    <span className="text-[10px] opacity-70">Click to download</span>
                  </div>
                </a>
              )}
              {msg.mediaType === "missed_call" && (
                <div
                  className={`flex items-center gap-3 p-3 rounded-2xl w-64 shadow-md my-1 border border-white/5 ${
                    isCurrentUser
                      ? "bg-[#005c4b] text-white"
                      : "bg-[#202c33] text-white"
                  }`}
                >
                  {/* Round WhatsApp Call Icon */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-base shrink-0 ${
                      isCurrentUser ? "bg-[#00382e]" : "bg-[#111b21]"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                    </svg>
                  </div>

                  {/* Call Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs leading-tight text-gray-100">
                      {msg.text?.includes("Audio") ? "Voice call" : "Video call"}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 font-medium ${
                        isCurrentUser ? "text-gray-200" : "text-gray-400"
                      }`}
                    >
                      No answer
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] self-end shrink-0 ml-auto font-normal ${
                      isCurrentUser ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Body */}
          {msg.text && (
            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
          )}

          {/* Reactions Badge Display */}
          {msg.reactions && msg.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {msg.reactions.map((r, rIdx) => (
                <span
                  key={rIdx}
                  className="badge badge-xs bg-base-100/40 text-base-content border-none px-1.5 py-0.5 text-[10px]"
                >
                  {r.emoji}
                </span>
              ))}
            </div>
          )}

          {/* WhatsApp Style Inline Timestamp & Functional Status Ticks */}
          <div className="flex items-center justify-end gap-1 text-[10px] opacity-80 mt-1 float-right select-none ml-2">
            <span>
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"}
            </span>
            {isCurrentUser && (
              <span className="font-bold text-[11px] leading-none ml-0.5">
                {msg.status === "seen" ? (
                  <span className="text-emerald-400 font-extrabold" title="Seen">✓✓</span>
                ) : msg.status === "delivered" ? (
                  <span className="opacity-80 text-primary-content/80" title="Delivered">✓✓</span>
                ) : (
                  <span className="opacity-80 text-primary-content/80" title="Sent">✓</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT HOVER ACTION: Reply Icon button */}
        {!msg.isDeleted && (
          <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInitiateReply(msg);
              }}
              className="btn btn-ghost btn-circle btn-xs text-base-content/70 hover:bg-base-200"
              title="Reply to message"
            >
              ↩️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
