import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL, DEFAULT_USER_AVATAR } from "../utils/constant";
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
    startPos.current = { x:clientX, y: clientY };
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
      className="relative w-full max-w-full sm:max-w-[420px] h-[calc(100dvh-7.5rem)] sm:h-[600px] rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing border border-base-300 dark:border-white/10 group bg-base-200 dark:bg-neutral my-auto"
    >
      {/* FULL CARD IMAGE */}
      <img
        src={photoUrl || DEFAULT_USER_AVATAR}
        alt={`${firstName}'s photo`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
        onError={(e) => {
          e.target.src = DEFAULT_USER_AVATAR;
        }}
      />

      {/* ELEGANT DUAL-MODE GRADIENT OVERLAY FOR HIGH CONTRAST */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-50% to-transparent pointer-events-none"></div>

      {/* SWIPE OVERLAY BADGES */}
      {showInterestedBadge && (
        <div
          style={{ opacity: badgeOpacity }}
          className="absolute top-8 left-8 z-30 border-2 border-emerald-400 text-emerald-400 bg-black/60 backdrop-blur-md font-extrabold text-sm tracking-widest px-4 py-1.5 rounded-full rotate-[-10deg] shadow-2xl pointer-events-none"
        >
          INTERESTED
        </div>
      )}

      {showIgnoreBadge && (
        <div
          style={{ opacity: badgeOpacity }}
          className="absolute top-8 right-8 z-30 border-2 border-rose-500 text-rose-500 bg-black/60 backdrop-blur-md font-extrabold text-sm tracking-widest px-4 py-1.5 rounded-full rotate-[10deg] shadow-2xl pointer-events-none"
        >
          PASS
        </div>
      )}

      {/* FLOATING CARD CONTENT OVERLAY (BOTTOM) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 z-20 flex flex-col justify-end pointer-events-none">
        {/* Minimalist User Info */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-lg">
              {firstName} {lastName}
            </h2>
            {age && (
              <span className="text-2xl sm:text-3xl font-bold text-primary drop-shadow">
                {age}
              </span>
            )}
          </div>

          {gender && (
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 capitalize tracking-wide shadow-sm">
                {gender}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/30 text-white backdrop-blur-md border border-primary/40 shadow-sm">
                Developer
              </span>
            </div>
          )}

          <p className="text-sm text-gray-100 mt-3 line-clamp-3 leading-relaxed drop-shadow font-normal">
            {about || "Tech enthusiast looking to connect and collaborate on innovative ideas."}
          </p>
        </div>

        {/* Sophisticated Circular Action Buttons - Light & Dark Mode Compatible */}
        <div className="flex items-center justify-center gap-8 pointer-events-auto pt-2">
          {/* Ignore / Pass Button */}
          <button
            type="button"
            className="w-14 h-14 rounded-full border border-rose-500/40 text-rose-500 bg-base-100/80 dark:bg-black/50 backdrop-blur-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 active:scale-90 transition-all duration-200 flex items-center justify-center shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
              triggerAction("ignored", "left");
            }}
            title="Pass"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Interested / Connect Button */}
          <button
            type="button"
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary text-white shadow-2xl shadow-primary/50 hover:scale-110 active:scale-90 transition-all duration-200 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              triggerAction("interested", "right");
            }}
            title="Interested"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        {/* Minimal Swipe Hint */}
        <p className="text-[10px] text-center text-gray-300 mt-3 font-medium tracking-wider uppercase drop-shadow">
          Swipe left to pass • Swipe right to connect
        </p>
      </div>
    </div>
  );
};

export default UserCard;