import React from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { DEFAULT_USER_AVATAR } from "../utils/constant";

const BottomNav = () => {
  const location = useLocation();
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const notifications = useSelector((store) => store.notifications) || { unreadCount: 0 };

  if (!user) return null;

  const currentPath = location.pathname;
  const pendingRequestsCount = Array.isArray(requests) ? requests.length : 0;
  const totalUnreadCount = (notifications.unreadCount || 0) + pendingRequestsCount;

  const navItems = [
    {
      id: "feed",
      label: "Explore",
      path: "/",
      icon: (active) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform ${active ? "scale-110 text-primary fill-primary/20" : "text-base-content/60"}`}
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={active ? "1.5" : "2"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9.879z"
          />
        </svg>
      ),
    },
    {
      id: "connections",
      label: "Matches",
      path: "/connections",
      icon: (active) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform ${active ? "scale-110 text-primary" : "text-base-content/60"}`}
          fill={active ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? "1.5" : "2"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "requests",
      label: "Requests",
      path: "/requests",
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      icon: (active) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform ${active ? "scale-110 text-primary" : "text-base-content/60"}`}
          fill={active ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? "1.5" : "2"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "chat",
      label: "Chats",
      path: "/chat",
      badge: notifications.unreadCount > 0 ? notifications.unreadCount : null,
      icon: (active) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform ${active ? "scale-110 text-primary" : "text-base-content/60"}`}
          fill={active ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? "1.5" : "2"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      path: "/profile",
      customIcon: (active) => (
        <div
          className={`w-6 h-6 rounded-full overflow-hidden transition-all ${
            active ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100 scale-110" : "opacity-75"
          }`}
        >
          <img
            src={user?.photoUrl || DEFAULT_USER_AVATAR}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = DEFAULT_USER_AVATAR;
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-xl border-t border-base-300/80 px-2 py-1 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive ? "text-primary" : "text-base-content/60"
              }`}
            >
              <div className="relative">
                {item.customIcon ? item.customIcon(isActive) : item.icon(isActive)}

                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-rose-500 to-primary text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-semibold mt-1 tracking-tight ${isActive ? "text-primary font-bold" : "text-base-content/60"}`}>
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-fade-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
