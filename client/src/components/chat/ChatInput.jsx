import React, { useState, useRef } from "react";

const ALL_EMOJIS = [
  "👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉", "😍", "🥳", 
  "👏", "💯", "🚀", "🤔", "👀", "🙌", "😎", "💩", "✨", "🤝"
];

const ChatInput = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  onSendVoiceNote, // (audioBlob, durationSec) => void
  onKeyDown,
  showInputEmojiPicker,
  setShowInputEmojiPicker,
  showAttachmentMenu,
  setShowAttachmentMenu,
  onFileSelect,
  onOpenGifModal,
  replyToMessage,
  onClearReply,
  pendingMedia,
  onClearPendingMedia,
  uploadingMedia,
}) => {
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        if (onSendVoiceNote) {
          onSendVoiceNote(audioBlob, recordingTime);
        }
        setRecordingTime(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(timerRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(timerRef.current);
      mediaRecorderRef.current.onstop = () => {
        const stream = mediaRecorderRef.current.stream;
        if (stream) stream.getTracks().forEach((track) => track.stop());
        setRecordingTime(0);
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col bg-base-100 border-t border-base-300">
      {/* Reply Preview Bar */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-base-200/90 border-t border-base-300 flex items-center justify-between text-xs animate-fade-in text-base-content">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-secondary font-bold">
              Replying to {replyToMessage.senderName}:
            </span>
            <span className="truncate text-base-content/70">
              {replyToMessage.text}
            </span>
          </div>
          <button
            onClick={onClearReply}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pending Upload Media Preview */}
      {pendingMedia && (
        <div className="px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center justify-between text-xs animate-fade-in text-base-content">
          <div className="flex items-center gap-2 min-w-0">
            <span className="badge badge-primary badge-xs uppercase font-bold text-[10px]">
              {pendingMedia.mediaType}
            </span>
            <span className="truncate font-medium">{pendingMedia.fileName}</span>
          </div>
          <button
            onClick={onClearPendingMedia}
            className="btn btn-ghost btn-xs btn-circle text-error"
          >
            ✕
          </button>
        </div>
      )}

      {/* ENHANCED INPUT BAR (Theme-Aware Light & Dark Mode) */}
      <div className="p-2.5 px-4 flex items-center gap-2 relative bg-base-100">
        {isRecording ? (
          /* Voice Note Recording Live Bar */
          <div className="flex-1 flex items-center justify-between bg-base-200 border border-base-300 rounded-2xl px-4 py-2.5 text-base-content animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-mono text-sm text-red-500 font-bold">
                {formatRecordingTime(recordingTime)}
              </span>
              <span className="text-xs text-base-content/70">Recording voice note...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelRecording}
                className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-error"
                title="Cancel"
              >
                ✕
              </button>
              <button
                onClick={stopAndSendRecording}
                className="btn btn-success btn-circle btn-sm text-white"
                title="Send Voice Note"
              >
                ✓
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Emoji Picker Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowInputEmojiPicker(!showInputEmojiPicker);
                  setShowAttachmentMenu(false);
                }}
                className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-base-content text-lg"
                title="Choose emoji"
              >
                😊
              </button>

              {/* Input Emoji Picker Popover */}
              {showInputEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-40 bg-base-100 border border-base-300 rounded-2xl p-3 shadow-2xl grid grid-cols-5 gap-2 w-60 animate-fade-in text-lg text-base-content">
                  {ALL_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage((prev) => prev + emoji);
                      }}
                      className="hover:scale-125 transition-transform p-1 rounded-lg hover:bg-base-200 text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Attachment Menu (+ Paperclip) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu);
                  setShowInputEmojiPicker(false);
                }}
                className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-base-content"
                title="Attach file"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>

              {/* Attachment Options Popover */}
              {showAttachmentMenu && (
                <div className="absolute bottom-12 left-0 z-40 bg-base-100 border border-base-300 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 w-48 animate-fade-in text-xs font-semibold text-base-content">
                  <button
                    onClick={() => onFileSelect("image/*")}
                    className="flex items-center gap-2 p-2.5 hover:bg-base-200 rounded-xl text-left"
                  >
                    <span>🖼️</span> Image / Photo
                  </button>
                  <button
                    onClick={() => onFileSelect("video/*")}
                    className="flex items-center gap-2 p-2.5 hover:bg-base-200 rounded-xl text-left"
                  >
                    <span>🎥</span> Video File
                  </button>
                  <button
                    onClick={() => onFileSelect("audio/*")}
                    className="flex items-center gap-2 p-2.5 hover:bg-base-200 rounded-xl text-left"
                  >
                    <span>🎵</span> Audio Clip
                  </button>
                  <button
                    onClick={() => onFileSelect(".pdf,.doc,.docx,.txt,.zip")}
                    className="flex items-center gap-2 p-2.5 hover:bg-base-200 rounded-xl text-left"
                  >
                    <span>📄</span> Document File
                  </button>
                  <button
                    onClick={onOpenGifModal}
                    className="flex items-center gap-2 p-2.5 hover:bg-base-200 rounded-xl text-left"
                  >
                    <span>🎨</span> GIF Link
                  </button>
                </div>
              )}
            </div>

            {/* Textarea Input */}
            <textarea
              rows={1}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={onKeyDown}
              className="textarea textarea-bordered flex-1 bg-base-200/60 focus:bg-base-100 text-base-content focus:border-primary focus:outline-none transition-all text-sm rounded-2xl min-h-[2.6rem] max-h-32 resize-none py-2 px-4 border border-base-300"
            />

            {/* Mic / Send Button */}
            {newMessage.trim() || pendingMedia ? (
              <button
                onClick={onSendMessage}
                disabled={uploadingMedia}
                className="btn btn-primary btn-circle btn-sm text-primary-content shadow-md"
                title="Send Message"
              >
                {uploadingMedia ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-base-content text-lg"
                title="Record Voice Note"
              >
                🎤
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
