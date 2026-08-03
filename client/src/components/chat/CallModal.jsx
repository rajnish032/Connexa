import React, { useEffect } from "react";
import { ringtoneManager } from "../../utils/ringtone";

const CallModal = ({
  callState, // { isCalling: bool, isReceivingCall: bool, isCallActive: bool, callerName: string, callType: 'video'|'audio' }
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isVideoOff,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  onToggleMute,
  onToggleVideo,
}) => {
  // Ringtone Audio Effect
  useEffect(() => {
    if (callState.isReceivingCall && !callState.isCallActive) {
      ringtoneManager.startRingtone("incoming");
    } else if (callState.isCalling && !callState.isCallActive) {
      ringtoneManager.startRingtone("outgoing");
    } else {
      ringtoneManager.stopRingtone();
    }

    return () => {
      ringtoneManager.stopRingtone();
    };
  }, [callState.isReceivingCall, callState.isCalling, callState.isCallActive]);

  if (!callState.isCalling && !callState.isReceivingCall && !callState.isCallActive) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0b141a] flex flex-col justify-between p-4 animate-fade-in font-sans">
      
      {/* OUTGOING CALLING MODAL (FOR CALLER) */}
      {callState.isCalling && !callState.isCallActive && (
        <div className="m-auto bg-[#202c33] border border-[#2a3942] rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl space-y-6 text-white animate-fade-in">
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 rounded-full bg-[#00a884]/20 animate-ping"></div>
            <div className="w-28 h-28 rounded-full bg-[#111b21] border-2 border-[#00a884] flex items-center justify-center relative z-10 shadow-xl">
              <span className="text-5xl">
                {callState.callType === "video" ? "📹" : "📞"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-2xl text-gray-100">
              {callState.callerName || "Connection"}
            </h3>
            <p className="text-xs text-[#00a884] font-semibold mt-1 uppercase tracking-wider">
              Calling...
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onEndCall}
              className="btn btn-circle w-16 h-16 bg-[#ea0038] hover:bg-red-700 border-none text-white shadow-xl hover:scale-110 transition-transform"
              title="Cancel Call"
            >
              📞
            </button>
          </div>
        </div>
      )}

      {/* INCOMING CALL ALERT MODAL (WHATSAPP FLOATING NOTIFICATION) */}
      {callState.isReceivingCall && !callState.isCalling && !callState.isCallActive && (
        <div className="m-auto bg-[#202c33] border border-[#00a884]/40 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl space-y-6 text-white animate-bounce-subtle">
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 rounded-full bg-[#00a884]/30 animate-pulse"></div>
            <div className="w-28 h-28 rounded-full bg-[#111b21] border-2 border-[#00a884] flex items-center justify-center relative z-10 shadow-2xl">
              <span className="text-5xl">
                {callState.callType === "video" ? "🎥" : "📞"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-2xl text-gray-100">
              {callState.callerName || "Connection"}
            </h3>
            <p className="text-xs text-[#00a884] font-semibold mt-1 capitalize">
              Incoming  {callState.callType || "Video"} Call...
            </p>
          </div>

          <div className="flex justify-center gap-6 pt-2">
            <button
              onClick={onRejectCall}
              className="btn btn-circle w-16 h-16 bg-[#ea0038] hover:bg-red-700 border-none text-white shadow-xl hover:scale-110 transition-transform text-lg"
              title="Decline Call"
            >
              ✕
            </button>
            <button
              onClick={onAcceptCall}
              className="btn btn-circle w-16 h-16 bg-[#00a884] hover:bg-[#008f70] border-none text-white shadow-xl hover:scale-110 transition-transform animate-pulse text-lg"
              title="Accept Call"
            >
              ✓
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE CALL OVERLAY - MATCHING IMAGE 2 EXACT WHATSAPP WEB UI */}
      {callState.isCallActive && (
        <div className="w-full h-full flex flex-col justify-between relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-[#2a3942]">
          
          {/* Top Encrypted Security Header */}
          <div className="py-3 px-6 text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5 z-20 bg-gradient-to-b from-black/80 to-transparent">
            <span>🔒</span> End-to-end encrypted
          </div>

          {/* Center Main Remote Video Stream */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover max-h-[80vh] rounded-2xl ${
                callState.callType === "audio" ? "hidden" : "block"
              }`}
            />

            {/* Audio Call Avatar View */}
            {callState.callType === "audio" && (
              <div className="flex flex-col items-center gap-4 text-white my-auto">
                <div className="w-36 h-36 rounded-full bg-[#00a884]/20 border-4 border-[#00a884] flex items-center justify-center text-6xl shadow-2xl animate-pulse">
                  👤
                </div>
                <p className="font-extrabold text-2xl">{callState.callerName}</p>
                <p className="text-xs text-[#00a884] font-semibold uppercase tracking-wider">
                  Audio Call Active
                </p>
              </div>
            )}

            {/* Local Video Self View (Floating Picture-in-Picture in Bottom Right) */}
            {callState.callType === "video" && (
              <div className="absolute bottom-4 right-4 w-28 sm:w-60 h-36 sm:h-80 bg-[#111b21] rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-30">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Bottom Dock Control Bar - Matching Image 2 Controls */}
          <div className="p-3 sm:p-4 bg-black/90 flex justify-between items-center z-30 px-3 sm:px-10 border-t border-white/10">
            {/* Left Control Group (Camera & Mic toggles) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {callState.callType === "video" && (
                <button
                  onClick={onToggleVideo}
                  className={`btn btn-circle btn-sm sm:btn-md text-xs sm:text-sm ${
                    isVideoOff ? "bg-red-600 text-white" : "bg-[#202c33] hover:bg-[#2a3942] text-white border border-white/10"
                  }`}
                  title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isVideoOff ? "📷" : "📹"}
                </button>
              )}
              <button
                onClick={onToggleMute}
                className={`btn btn-circle btn-sm sm:btn-md text-xs sm:text-sm ${
                  isMuted ? "bg-red-600 text-white" : "bg-[#202c33] hover:bg-[#2a3942] text-white border border-white/10"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? "🔇" : "🎙️"}
              </button>
            </div>

            {/* Center Reaction & Participant Icons */}
            <div className="flex items-center gap-2 sm:gap-4 bg-[#111b21] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10">
              <span className="cursor-pointer hover:scale-125 transition-transform text-sm sm:text-lg" title="Reactions">😊</span>
              <span className="cursor-pointer hover:scale-125 transition-transform text-sm sm:text-lg" title="Participants">👥</span>
              <span className="cursor-pointer hover:scale-125 transition-transform text-sm sm:text-lg" title="Chat">💬</span>
            </div>

            {/* Right Group (Red End Call Button) */}
            <div>
              <button
                onClick={onEndCall}
                className="btn btn-circle w-10 h-10 sm:w-12 sm:h-12 bg-[#ea0038] hover:bg-red-700 border-none text-white shadow-2xl hover:scale-110 transition-transform"
                title="End Call"
              >
                📞
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default CallModal;
