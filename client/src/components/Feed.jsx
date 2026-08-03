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
  const [loading, setLoading] = useState(!feed);

  const getFeed = async () => {
    if (feed) return;
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  if (loading && !feed) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center py-8 px-4 w-full">
      <AnimatedBackground />

      <div className="z-10 w-full flex justify-center">
        {!feed || feed.length === 0 ? (
          <div className="text-center p-8 max-w-sm bg-base-200 border border-base-300 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-base-content mb-2">
              No New Profiles
            </h2>
            <p className="text-sm text-base-content/60 mb-5">
              You've viewed all available profiles for now.
            </p>
            <Link to="/connections" className="btn btn-primary btn-sm rounded-lg">
              View Connections
            </Link>
          </div>
        ) : (
          <UserCard user={feed[0]} />
        )}
      </div>
    </div>
  );
};

export default Feed;