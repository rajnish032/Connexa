import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router";
import { BASE_URL, DEFAULT_USER_AVATAR } from "../utils/constant";
import { removeUser } from "../store/userSlice";
import { clearFeed } from "../store/feedSlice";
import { useDispatch, useSelector } from "react-redux";
import { markAllAsRead, clearNotifications } from "../store/notificationSlice";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const notifications = useSelector((store) => store.notifications) || { items: [], unreadCount: 0 };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isChatRoute = location.pathname.startsWith("/chat");

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      dispatch(clearFeed());
      return navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "chat":
        return "💬";
      case "video_call":
        return "📹";
      case "audio_call":
        return "📞";
      case "request":
        return "👥";
      case "accept":
        return "✅";
      default:
        return "🔔";
    }
  };

  return (
    <div
      className={`${
        isChatRoute ? "hidden md:flex" : "flex"
      } navbar bg-base-100/90 backdrop-blur-md sticky top-0 z-50 border-b border-base-300 px-4 md:px-8 shadow-sm`}
    >
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl font-extrabold tracking-tight gap-2">
          <span className="text-2xl">👦🏻</span>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Connexa
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle text-base-content"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-warning transition-transform hover:rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary transition-transform hover:-rotate-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {user && (
          <>
            {/* REAL-TIME NOTIFICATION BELL DROPDOWN */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle relative text-base-content"
                onClick={() => dispatch(markAllAsRead())}
                title="Notifications"
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notifications.unreadCount > 0 && (
                  <span className="badge badge-primary badge-xs absolute top-1 right-1 font-bold animate-pulse px-1">
                    {notifications.unreadCount}
                  </span>
                )}
              </div>

              {/* Notification Popover List */}
              <div
                tabIndex={0}
                className="dropdown-content bg-base-100 border border-base-300 rounded-3xl z-50 mt-3 w-80 sm:w-96 p-3 shadow-2xl animate-fade-in text-base-content"
              >
                <div className="flex justify-between items-center px-3 py-2 border-b border-base-200">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <span>🔔</span> Notifications
                    <span className="badge badge-primary badge-xs">
                      {notifications.items.length}
                    </span>
                  </h3>
                  {notifications.items.length > 0 && (
                    <button
                      onClick={() => dispatch(clearNotifications())}
                      className="text-[11px] text-error hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-base-200 py-1">
                  {notifications.items.length === 0 ? (
                    <div className="p-6 text-center text-xs opacity-60">
                      <p className="text-2xl mb-1">🔕</p>
                      No new notifications yet.
                    </div>
                  ) : (
                    notifications.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.link) navigate(item.link);
                        }}
                        className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-base-200/60 transition-colors rounded-xl ${
                          !item.isRead ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="text-xl pt-0.5">{getNotifIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-bold text-xs truncate">
                              {item.title || "Notification"}
                            </h4>
                            <span className="text-[10px] opacity-60 ml-2 shrink-0">
                              {item.timestamp
                                ? new Date(item.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Now"}
                            </span>
                          </div>
                          <p className="text-xs opacity-80 truncate mt-0.5">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Link to="/chat" className="btn btn-ghost btn-sm gap-2 hidden md:flex">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Chats
            </Link>

            <span className="text-sm font-medium text-base-content/80 hidden sm:inline">
              Welcome, <strong className="text-base-content">{user.firstName}</strong>
            </span>

            {/* Profile Avatar Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar ring ring-primary/20 ring-offset-base-100 ring-offset-2"
              >
                <div className="w-10 rounded-full">
                  <img
                    alt={`${user.firstName}'s avatar`}
                    src={user.photoUrl || DEFAULT_USER_AVATAR}
                    onError={(e) => {
                      e.target.src = DEFAULT_USER_AVATAR;
                    }}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 border border-base-300 rounded-box z-50 mt-3 w-56 p-2 shadow-xl"
              >
                <li>
                  <Link to="/profile" className="justify-between py-2">
                    Profile
                    <span className="badge badge-primary badge-sm">View</span>
                  </Link>
                </li>
                <li>
                  <Link to="/connections" className="py-2">
                    Connections
                  </Link>
                </li>
                <li>
                  <Link to="/requests" className="py-2">
                    Requests
                  </Link>
                </li>
                <li>
                  <Link to="/chat" className="py-2">
                    Chat Room
                  </Link>
                </li>
                <li>
                  <Link to="/premium" className="py-2">
                    Premium
                  </Link>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-error py-2 hover:bg-error/10"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
