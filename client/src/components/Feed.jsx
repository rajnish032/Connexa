import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { addFeed } from "../store/feedSlice";
import { BASE_URL } from "../utils/constant";
import UserCard from "./UserCard";
import AnimatedBackground from "./AnimatedBackground";
import { Link } from "react-router";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data || []));
    } catch (err) {
      console.error("Failed to fetch feed:", err);
      setError("Failed to load profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!feed) {
      getFeed();
    }
  }, [feed]);

  if (loading && (!feed || feed.length === 0)) {
    return (
      <div className="relative flex-1 w-full h-[calc(100dvh-4.05rem)] flex flex-col items-center justify-center p-4 overflow-hidden">
        <AnimatedBackground />
        <div className="z-10 flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm text-base-content/60 font-medium animate-pulse">
            Finding nearby developers...
          </p>
        </div>
      </div>
    );
  }

  if (error && (!feed || feed.length === 0)) {
    return (
      <div className="relative flex-1 w-full h-[calc(100dvh-4.05rem)] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        <AnimatedBackground />
        <div className="z-10 w-full h-full flex justify-center items-center my-auto">
          <div className="text-center p-8 max-w-sm bg-base-100/90 backdrop-blur-lg border border-base-300 rounded-3xl shadow-xl my-auto">
            <div className="text-5xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-base-content mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-base-content/60 mb-5">{error}</p>
            <button
              onClick={getFeed}
              className="btn btn-primary btn-sm rounded-xl px-6"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full h-[calc(100dvh-4.05rem)] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
      <AnimatedBackground />

      <div className="z-10 w-full h-full flex justify-center items-center my-auto">
        {!feed || feed.length === 0 ? (
          <div className="text-center p-8 max-w-sm bg-base-100/90 backdrop-blur-lg border border-base-300 rounded-3xl shadow-xl my-auto">
            <div className="text-5xl mb-3">🔥</div>
            <h2 className="text-xl font-bold text-base-content mb-2">
              No New Profiles
            </h2>
            <p className="text-sm text-base-content/60 mb-5">
              You've viewed all available profiles for now.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={getFeed}
                className="btn btn-primary btn-sm rounded-xl px-6"
              >
                Refresh Profiles
              </button>
              <Link
                to="/connections"
                className="btn btn-ghost btn-xs text-base-content/70 hover:text-base-content"
              >
                View Matches
              </Link>
            </div>
          </div>
        ) : (
          <UserCard user={feed[0]} />
        )}
      </div>
    </div>
  );
};

export default Feed;