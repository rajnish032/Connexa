import { useEffect, useState, useRef } from "react";
import { createSocketConnection } from "../utils/socket";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useParams, useNavigate, Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { addConnections } from "../store/connectionSlice";

// Modular Sub-Components
import ChatSidebar from "./chat/ChatSidebar";
import ChatHeader from "./chat/ChatHeader";
import MessageBubble from "./chat/MessageBubble";
import ChatInput from "./chat/ChatInput";
import CallModal from "./chat/CallModal";

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections);
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Attachment & Media State
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingMedia, setPendingMedia] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [gifUrlInput, setGifUrlInput] = useState("");
  const [showGifModal, setShowGifModal] = useState(false);

  // Emoji & Reaction State
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const [activeReactMsgId, setActiveReactMsgId] = useState(null);
  const [doubleClickMsgId, setDoubleClickMsgId] = useState(null);
  const [showMenuEmojiPicker, setShowMenuEmojiPicker] = useState(false);

  // Reply Context State
  const [replyToMessage, setReplyToMessage] = useState(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState("");

  // WebRTC Call State
  const [callState, setCallState] = useState({
    isCalling: false,
    isReceivingCall: false,
    isCallActive: false,
    callerName: "",
    callType: "video", // 'video' | 'audio'
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [fileInputType, setFileInputType] = useState("image/*");

  // WebRTC Refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const activeTargetUser = connections?.find((c) => c._id === targetUserId);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2000);
  };

  // Fetch connections
  const fetchConnections = async () => {
    if (connections && connections.length > 0) return;
    setLoadingConnections(true);
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Fetch chat history for targetUserId
  const fetchChatMessages = async () => {
    if (!targetUserId) return;
    setLoadingChat(true);
    try {
      const chat = await axios.get(BASE_URL + "/chat/" + targetUserId, {
        withCredentials: true,
      });

      const chatMessages = (chat?.data?.messages || []).map((msg) => {
        const { _id, senderId, text, mediaUrl, mediaType, fileName, replyTo, reactions, status, isDeleted, createdAt } = msg;
        return {
          _id,
          senderId: senderId?._id || senderId,
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          photoUrl: senderId?.photoUrl,
          text: text || "",
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
          fileName: fileName || null,
          replyTo: replyTo || null,
          reactions: reactions || [],
          status: status || "sent",
          isDeleted: isDeleted || false,
          createdAt: createdAt || new Date().toISOString(),
        };
      });
      setMessages(chatMessages);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (targetUserId) {
      fetchChatMessages();
    } else {
      setMessages([]);
    }
    setReplyToMessage(null);
    setPendingMedia(null);
    setActiveReactMsgId(null);
    setDoubleClickMsgId(null);
    setShowMenuEmojiPicker(false);
  }, [targetUserId]);

  // Socket & WebRTC Signaling Listener
  useEffect(() => {
    if (!userId || !targetUserId) return;

    const socket = createSocketConnection();
    socket.emit("joinChat", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    socket.on("messageReceived", (incomingMsg) => {
      setMessages((prev) => [...prev, incomingMsg]);
    });

    socket.on("messageReacted", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
      );
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, text: "This message was deleted", mediaUrl: null, mediaType: null }
            : msg
        )
      );
    });

    socket.on("messagesSeen", () => {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          status: "seen",
        }))
      );
    });

    return () => {
      socket.off("messageReceived");
      socket.off("messagesSeen");
      socket.off("messageReacted");
      socket.off("messageDeleted");
    };
  }, [userId, targetUserId]);

  // In-Chat Search Filter State
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState("");

  // Send Voice Note Handler
  const handleSendVoiceNote = async (audioBlob, durationSec) => {
    if (!targetUserId || !userId) return;

    setUploadingMedia(true);
    try {
      const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mediaType", "audio");
      formData.append("fileName", `Voice Note (${durationSec}s)`);

      const res = await axios.post(BASE_URL + "/chat/upload", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.data) {
        const socket = createSocketConnection();
        socket.emit("sendMessage", {
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          userId,
          targetUserId,
          text: "",
          mediaUrl: res.data.data.url,
          mediaType: "audio",
          fileName: `Voice Note (${durationSec}s)`,
          replyTo: null,
        });
      }
    } catch (err) {
      console.error("Failed to upload voice note:", err);
      showToast("Failed to send voice note.");
    } finally {
      setUploadingMedia(false);
    }
  };

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingChat, pendingMedia]);

  // Send Message
  const sendMessage = () => {
    if ((!newMessage.trim() && !pendingMedia) || !targetUserId || !userId) return;

    const socket = createSocketConnection();

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      userId,
      targetUserId,
      text: newMessage.trim(),
      mediaUrl: pendingMedia?.url || null,
      mediaType: pendingMedia?.mediaType || null,
      fileName: pendingMedia?.fileName || null,
      replyTo: replyToMessage
        ? {
            messageId: replyToMessage._id,
            text: replyToMessage.text,
            senderName: replyToMessage.senderName,
            mediaType: replyToMessage.mediaType,
          }
        : null,
    };

    socket.emit("sendMessage", payload);

    setNewMessage("");
    setPendingMedia(null);
    setReplyToMessage(null);
    setShowInputEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (acceptType) => {
    setFileInputType(acceptType);
    setShowAttachmentMenu(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingMedia(true);
    let mediaType = "document";
    if (file.type.startsWith("image/")) mediaType = "image";
    else if (file.type.startsWith("video/")) mediaType = "video";
    else if (file.type.startsWith("audio/")) mediaType = "audio";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mediaType", mediaType);
      formData.append("fileName", file.name);

      const res = await axios.post(BASE_URL + "/chat/upload", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.data) {
        setPendingMedia(res.data.data);
      }
    } catch (err) {
      console.error("Upload error, falling back to FileReader:", err);
      const reader = new FileReader();
      reader.onload = () => {
        setPendingMedia({
          url: reader.result,
          mediaType,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddGif = () => {
    if (!gifUrlInput.trim()) return;
    setPendingMedia({
      url: gifUrlInput.trim(),
      mediaType: "gif",
      fileName: "GIF",
    });
    setGifUrlInput("");
    setShowGifModal(false);
  };

  const handleReact = (msgId, emoji) => {
    const socket = createSocketConnection();
    socket.emit("reactMessage", {
      userId,
      targetUserId,
      messageId: msgId,
      emoji,
    });
    setActiveReactMsgId(null);
    setDoubleClickMsgId(null);
    setShowMenuEmojiPicker(false);
  };

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Message copied to clipboard!");
    setDoubleClickMsgId(null);
    setShowMenuEmojiPicker(false);
  };

  const handleDeleteMessage = (msgId) => {
    const socket = createSocketConnection();
    socket.emit("deleteMessage", {
      userId,
      targetUserId,
      messageId: msgId,
    });
    setDoubleClickMsgId(null);
    setShowMenuEmojiPicker(false);
  };

  const handleInitiateReply = (msg) => {
    setReplyToMessage({
      _id: msg._id,
      text: msg.text || (msg.mediaType ? `[${msg.mediaType}]` : "Message"),
      senderName: msg.firstName || "User",
      mediaType: msg.mediaType,
    });
    setDoubleClickMsgId(null);
    setShowMenuEmojiPicker(false);
  };

  // --- WEBRTC P2P CALL HANDLERS ---
  const startCall = (callType) => {
    if (!targetUserId) return;
    const callerName = activeTargetUser ? `${activeTargetUser.firstName} ${activeTargetUser.lastName}` : "Connection";
    window.dispatchEvent(
      new CustomEvent("startGlobalCall", {
        detail: {
          targetUserId,
          callType,
          callerName,
        },
      })
    );
  };

  return (
    <div className="w-full h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4.05rem)] flex bg-base-100 text-base-content overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral text-neutral-content px-4 py-2 rounded-xl text-xs font-semibold shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={fileInputType}
        className="hidden"
      />

      <div className="w-full h-full flex flex-col md:flex-row overflow-hidden border-t border-base-300">
        
        {/* LEFT SIDEBAR */}
        <ChatSidebar
          connections={connections}
          loadingConnections={loadingConnections}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          targetUserId={targetUserId}
          onSelectConnection={(id) => navigate(`/chat/${id}`)}
        />

        {/* RIGHT MAIN PANEL */}
        <div
          className={`flex-1 flex flex-col bg-base-100 min-h-0 h-full overflow-hidden ${
            !targetUserId ? "hidden md:flex" : "flex"
          }`}
        >
          {targetUserId ? (
            <>
              {/* Chat Header with Video/Audio Call triggers and In-Chat Search */}
              <ChatHeader
                activeTargetUser={activeTargetUser}
                onBackToSidebar={() => navigate("/chat")}
                onStartCall={startCall}
                showInChatSearch={showInChatSearch}
                setShowInChatSearch={setShowInChatSearch}
                inChatSearchQuery={inChatSearchQuery}
                setInChatSearchQuery={setInChatSearchQuery}
              />

              {/* Chat Messages Thread */}
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-4 md:p-6 space-y-4 bg-base-200/40 relative"
                onClick={() => {
                  setActiveReactMsgId(null);
                  setDoubleClickMsgId(null);
                  setShowMenuEmojiPicker(false);
                  setShowAttachmentMenu(false);
                  setShowInputEmojiPicker(false);
                }}
              >
                {loadingChat ? (
                  <div className="flex justify-center items-center h-full">
                    <span className="loading loading-spinner loading-md text-[#00a884]"></span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#202c33] border border-[#2a3942] flex items-center justify-center mb-3">
                      <span className="text-3xl">👋</span>
                    </div>
                    <p className="font-semibold text-base text-gray-200">
                      Start the conversation!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Send a message, photo, or voice note to start chatting.
                    </p>
                  </div>
                ) : (
                  messages
                    .filter((m) =>
                      inChatSearchQuery
                        ? (m.text || "").toLowerCase().includes(inChatSearchQuery.toLowerCase())
                        : true
                    )
                    .map((msg, index) => (
                      <MessageBubble
                        key={msg._id || index}
                        msg={msg}
                        userId={userId}
                        userFirstName={user?.firstName}
                        activeReactMsgId={activeReactMsgId}
                        setActiveReactMsgId={setActiveReactMsgId}
                        doubleClickMsgId={doubleClickMsgId}
                        setDoubleClickMsgId={setDoubleClickMsgId}
                        showMenuEmojiPicker={showMenuEmojiPicker}
                        setShowMenuEmojiPicker={setShowMenuEmojiPicker}
                        onReact={handleReact}
                        onInitiateReply={handleInitiateReply}
                        onCopyText={handleCopyText}
                        onDeleteMessage={handleDeleteMessage}
                      />
                    ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={sendMessage}
                onSendVoiceNote={handleSendVoiceNote}
                onKeyDown={handleKeyDown}
                showInputEmojiPicker={showInputEmojiPicker}
                setShowInputEmojiPicker={setShowInputEmojiPicker}
                showAttachmentMenu={showAttachmentMenu}
                setShowAttachmentMenu={setShowAttachmentMenu}
                onFileSelect={handleFileSelect}
                onOpenGifModal={() => {
                  setShowAttachmentMenu(false);
                  setShowGifModal(true);
                }}
                replyToMessage={replyToMessage}
                onClearReply={() => setReplyToMessage(null)}
                pendingMedia={pendingMedia}
                onClearPendingMedia={() => setPendingMedia(null)}
                uploadingMedia={uploadingMedia}
              />
            </>
          ) : (
            /* WhatsApp Web Style Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-base-200/30">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-inner">
                <span className="text-5xl">💬</span>
              </div>
              <h2 className="text-2xl font-extrabold text-base-content tracking-tight mb-2">
                Connexa Web & Call Platform
              </h2>
              <p className="text-sm text-base-content/60 max-w-md mb-6 leading-relaxed">
                Select a conversation to message or start HD Video and Audio calls with your connections.
              </p>
              <Link to="/connections" className="btn btn-primary btn-sm gap-2 px-5 rounded-lg">
                View All Connections
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* GIF URL Modal */}
      {showGifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 border border-base-300 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg mb-2">Insert GIF URL</h3>
            <input
              type="text"
              placeholder="https://media.giphy.com/media/..."
              value={gifUrlInput}
              onChange={(e) => setGifUrlInput(e.target.value)}
              className="input input-bordered w-full mb-4 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGifModal(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGif}
                className="btn btn-primary btn-sm"
              >
                Add GIF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;