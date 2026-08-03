import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { addNotification } from "../../store/notificationSlice";
import { createSocketConnection } from "../../utils/socket";
import { ringtoneManager } from "../../utils/ringtone";
import CallModal from "./CallModal";

const GlobalCallListener = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const currentUserId = String(user?._id || user?.data?._id || "");
  const navigate = useNavigate();
  const location = useLocation();

  const [callState, setCallState] = useState({
    isCalling: false,
    isReceivingCall: false,
    isCallActive: false,
    callerName: "",
    callType: "video",
    targetUserId: null,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]); // ICE Candidate Queue
  const callTimeoutRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = createSocketConnection();

    const handleJoinUserRoom = () => {
      socket.emit("joinUser", { userId: currentUserId });
    };

    if (socket.connected) {
      handleJoinUserRoom();
    }
    socket.on("connect", handleJoinUserRoom);

    socket.on("incomingCall", ({ from, name, callType, signal }) => {
      const fromStr = String(from);
      if (fromStr === currentUserId) return; // Prevent self call

      dispatch(
        addNotification({
          type: callType === "video" ? "video_call" : "audio_call",
          title: callType === "video" ? "Incoming Video Call" : "Incoming Audio Call",
          message: `${name || "Connection"} is calling you...`,
          senderName: name || "Connection",
          link: `/chat/${fromStr}`,
        })
      );

      setCallState({
        isCalling: false,
        isReceivingCall: true,
        isCallActive: false,
        callerName: name || "Connection",
        callType: callType || "video",
        targetUserId: fromStr,
      });
      peerConnectionRef.current = { from: fromStr, signal };
    });

    socket.on("callAccepted", async ({ signal }) => {
      setCallState((prev) => ({ ...prev, isCalling: false, isCallActive: true }));
      if (peerConnectionRef.current?.pc) {
        try {
          const pc = peerConnectionRef.current.pc;
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          // Drain queued ICE candidates
          while (pendingCandidatesRef.current.length > 0) {
            const cand = pendingCandidatesRef.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        } catch (err) {
          console.error("Error setting remote description on callAccepted:", err);
        }
      }
    });

    socket.on("callRejected", () => {
      endCallCleanup();
    });

    socket.on("callEnded", () => {
      endCallCleanup();
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (!candidate) return;
      const pc = peerConnectionRef.current?.pc;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        // Queue candidate if remote description is not set yet
        pendingCandidatesRef.current.push(candidate);
      }
    });

    socket.on("newNotification", (notifData) => {
      dispatch(addNotification(notifData));
    });

    const handleStartGlobalCall = async (e) => {
      const { targetUserId, callType, callerName } = e.detail || {};
      if (!targetUserId) return;

      try {
        const constraints = {
          audio: true,
          video: callType === "video",
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            remoteStreamRef.current = event.streams[0];
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("iceCandidate", {
              to: targetUserId,
              from: currentUserId,
              candidate: event.candidate,
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        peerConnectionRef.current = { pc, targetUserId };

        setCallState({
          isCalling: true,
          isReceivingCall: false,
          isCallActive: false,
          callerName: callerName || "Connection",
          callType: callType || "video",
          targetUserId,
        });

        socket.emit("callUser", {
          userToCall: targetUserId,
          signalData: offer,
          from: currentUserId,
          name: user?.firstName || "Connection",
          callType: callType || "video",
        });
      } catch (err) {
        console.error("Camera/Mic access error starting call:", err);
      }
    };

    window.addEventListener("startGlobalCall", handleStartGlobalCall);

    return () => {
      window.removeEventListener("startGlobalCall", handleStartGlobalCall);
      socket.off("connect", handleJoinUserRoom);
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("iceCandidate");
      socket.off("newNotification");
    };
  }, [currentUserId, dispatch, user?.firstName]);

  // 30-Second Automatic Ringing Timeout
  useEffect(() => {
    if ((callState.isCalling || callState.isReceivingCall) && !callState.isCallActive) {
      callTimeoutRef.current = setTimeout(() => {
        if (callState.isCalling && callState.targetUserId) {
          const socket = createSocketConnection();
          socket.emit("missedCall", {
            to: callState.targetUserId,
            from: currentUserId,
            callType: callState.callType,
          });
          socket.emit("endCall", { to: callState.targetUserId, from: currentUserId });
        }
        endCallCleanup();
      }, 30000);
    } else {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    }

    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    };
  }, [callState.isCalling, callState.isReceivingCall, callState.isCallActive, callState.targetUserId, callState.callType, currentUserId]);

  const remoteStreamRef = useRef(null);

  // Bind local & remote video streams to HTML elements when call becomes active
  useEffect(() => {
    if (callState.isCallActive) {
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      if (remoteStreamRef.current && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    }
  }, [callState.isCallActive]);

  const acceptCall = async () => {
    try {
      const callType = callState.callType || "video";
      const targetUserId = callState.targetUserId;
      const constraints = {
        audio: true,
        video: callType === "video",
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && callType === "video") {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            remoteStreamRef.current = event.streams[0];
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          }
        };

      const socket = createSocketConnection();

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: targetUserId,
            from: currentUserId,
            candidate: event.candidate,
          });
        }
      };

      const incomingSignal = peerConnectionRef.current?.signal;
      await pc.setRemoteDescription(new RTCSessionDescription(incomingSignal));

      // Drain queued ICE candidates if any were received while ringing
      while (pendingCandidatesRef.current.length > 0) {
        const cand = pendingCandidatesRef.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      peerConnectionRef.current = { pc, targetUserId };

      setCallState((prev) => ({ ...prev, isCalling: false, isReceivingCall: false, isCallActive: true }));

      socket.emit("answerCall", {
        to: targetUserId,
        from: currentUserId,
        signal: answer,
      });

      if (targetUserId && !location.pathname.includes(`/chat/${targetUserId}`)) {
        navigate(`/chat/${targetUserId}`);
      }
    } catch (err) {
      console.error("Error accepting global call:", err);
      rejectCall();
    }
  };

  const rejectCall = () => {
    const socket = createSocketConnection();
    if (callState.targetUserId) {
      socket.emit("missedCall", {
        to: currentUserId,
        from: callState.targetUserId,
        callType: callState.callType,
      });
      socket.emit("rejectCall", { to: callState.targetUserId, from: currentUserId });
    }
    endCallCleanup();
  };

  const endCall = () => {
    const socket = createSocketConnection();
    if (callState.targetUserId) {
      if (!callState.isCallActive) {
        socket.emit("missedCall", {
          to: callState.targetUserId,
          from: currentUserId,
          callType: callState.callType,
        });
      }
      socket.emit("endCall", { to: callState.targetUserId, from: currentUserId });
    }
    endCallCleanup();
  };

  const endCallCleanup = () => {
    ringtoneManager.stopRingtone();

    // Stop all audio & video tracks cleanly
    [
      localStreamRef.current,
      remoteStreamRef.current,
      localVideoRef.current?.srcObject,
      remoteVideoRef.current?.srcObject,
    ].forEach((stream) => {
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    localStreamRef.current = null;
    remoteStreamRef.current = null;
    if (peerConnectionRef.current?.pc) {
      try {
        peerConnectionRef.current.pc.close();
      } catch (e) {}
    }
    peerConnectionRef.current = null;
    pendingCandidatesRef.current = [];

    setCallState({
      isCalling: false,
      isReceivingCall: false,
      isCallActive: false,
      callerName: "",
      callType: "video",
      targetUserId: null,
    });
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <CallModal
      callState={callState}
      localVideoRef={localVideoRef}
      remoteVideoRef={remoteVideoRef}
      isMuted={isMuted}
      isVideoOff={isVideoOff}
      onAcceptCall={acceptCall}
      onRejectCall={rejectCall}
      onEndCall={endCall}
      onToggleMute={toggleMute}
      onToggleVideo={toggleVideo}
    />
  );
};

export default GlobalCallListener;
