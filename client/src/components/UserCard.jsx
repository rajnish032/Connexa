import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { removeUserFromFeed } from "../store/feedSlice";
import { useState, useRef } from "react";

const UserCard = ({ user }) => {
  if (!user) return null;
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
  const dispatch = useDispatch();

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(null); // 'left' | 'right' | null

  const startPos = useRef({ x: 0, y: 0 });

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error("Failed to send request:", err);
    }
  };

  const triggerAction = (status, direction) => {
    setExitDirection(direction);
    setTimeout(() => {
      handleSendRequest(status, _id);
      setExitDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 220);
  };

  // --- MOUSE / TOUCH GESTURE HANDLERS ---
  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const SWIPE_THRESHOLD = 90;

    if (dragOffset.x > SWIPE_THRESHOLD) {
      triggerAction("interested", "right");
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      triggerAction("ignored", "left");
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Mouse events
  const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Touch events
  const onTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };
  const onTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };
  const onTouchEnd = () => handleEnd();

  // Dynamic card transforms based on drag or exit direction
  let transformStyle = "";
  if (exitDirection === "right") {
    transformStyle = "translate3d(140vw, 0, 0) rotate(25deg)";
  } else if (exitDirection === "left") {
    transformStyle = "translate3d(-140vw, 0, 0) rotate(-25deg)";
  } else if (isDragging) {
    const rotation = dragOffset.x * 0.07;
    transformStyle = `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.15}px, 0) rotate(${rotation}deg)`;
  } else {
    transformStyle = "translate3d(0, 0, 0) rotate(0deg)";
  }

  // Swipe badges visibility & opacity
  const showInterestedBadge = dragOffset.x > 30;
  const showIgnoreBadge = dragOffset.x < -30;
  const badgeOpacity = Math.min(Math.abs(dragOffset.x) / 100, 1);

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: transformStyle,
        transition: isDragging ? "none" : "transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
      className="relative w-full max-w-[360px] sm:max-w-[390px] h-[520px] sm:h-[560px] rounded-[2.2rem] shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing border border-white/10 group"
    >
      {/* FULL CARD IMAGE */}
      <img
        src={
          photoUrl ||
          "https://geographyandthemotive.org/wp-content/uploads/2018/04/dummy-user-img.png"
        }
        alt={`${firstName}'s photo`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          e.target.src =
            "https://geographyandthemotive.org/wp-content/uploads/2018/04/dummy-user-img.png";
        }}
      />

      {/* FULL CARD GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none"></div>

      {/* SWIPE OVERLAY BADGES */}
      {showInterestedBadge && (
        <div
          style={{ opacity: badgeOpacity }}
          className="absolute top-6 left-6 z-30 border-4 border-emerald-400 text-emerald-400 bg-black/40 backdrop-blur-md font-black text-xl px-4 py-1.5 rounded-2xl rotate-[-12deg] tracking-widest shadow-2xl pointer-events-none"
        >
          INTERESTED
        </div>
      )}

      {showIgnoreBadge && (
        <div
          style={{ opacity: badgeOpacity }}
          className="absolute top-6 right-6 z-30 border-4 border-rose-500 text-rose-500 bg-black/40 backdrop-blur-md font-black text-xl px-4 py-1.5 rounded-2xl rotate-[12deg] tracking-widest shadow-2xl pointer-events-none"
        >
          IGNORE
        </div>
      )}

      {/* FLOATING CARD CONTENT OVERLAY (BOTTOM) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end pointer-events-none">
        {/* User Info */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
              {firstName} {lastName}
            </h2>
            {age && (
              <span className="text-2xl font-bold text-primary">
                {age}
              </span>
            )}
          </div>

          {gender && (
            <span className="inline-block mt-1.5 px-3 py-0.5 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 capitalize">
              {gender}
            </span>
          )}

          <p className="text-sm text-gray-200/90 mt-2.5 line-clamp-3 leading-relaxed drop-shadow">
            {about || "Tech enthusiast looking to connect and build awesome projects."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pointer-events-auto">
          {/* Ignore Button */}
          <button
            type="button"
            className="btn btn-error btn-outline rounded-xl flex-1 gap-1.5 font-bold shadow-lg backdrop-blur-md bg-black/30 hover:scale-105 active:scale-95 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              triggerAction("ignored", "left");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Ignore
          </button>

          {/* Interested Button */}
          <button
            type="button"
            className="btn btn-primary rounded-xl flex-1 gap-1.5 font-bold shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              triggerAction("interested", "right");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Interested
          </button>
        </div>

        {/* Swipe Hint */}
        <p className="text-[11px] text-center text-gray-400 mt-3 font-medium">
          👈 Swipe left to Ignore • Swipe right for Interested 👉
        </p>
      </div>
    </div>
  );
};

export default UserCard;