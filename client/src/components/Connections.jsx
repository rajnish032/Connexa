import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../store/connectionSlice";
import { BASE_URL, DEFAULT_USER_AVATAR } from "../utils/constant";
import { Link, useNavigate } from "react-router";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error("Failed to fetch connections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading && !connections) {
    return (
      <div className="flex flex-col justify-center items-center py-20 min-h-[50vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm font-medium text-base-content/60 animate-pulse">
          Loading your matches...
        </p>
      </div>
    );
  }

  const filteredConnections = (connections || []).filter((conn) => {
    const fullName = `${conn.firstName || ""} ${conn.lastName || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 w-full">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your Matches
            </h1>
            <span className="badge badge-primary font-bold text-xs">
              {connections?.length || 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            People you've mutually connected with on Connexa
          </p>
        </div>

        {connections && connections.length > 0 && (
          <div className="form-control w-full sm:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered input-sm w-full pr-9 bg-base-200/60 focus:bg-base-100 transition-all rounded-xl text-sm"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Instagram-Style Story Scroll Bar for Matches */}
      {connections && connections.length > 0 && (
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-4 min-w-max">
            {connections.slice(0, 10).map((conn) => (
              <div
                key={`story-${conn._id}`}
                onClick={() => navigate(`/chat/${conn._id}`)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary to-secondary group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={conn.photoUrl || DEFAULT_USER_AVATAR}
                      alt={conn.firstName}
                      className="rounded-full object-cover w-full h-full border-2 border-base-100"
                      onError={(e) => {
                        e.target.src = DEFAULT_USER_AVATAR;
                      }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-base-content/80 max-w-[64px] truncate text-center">
                  {conn.firstName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid / Empty State */}
      {!connections || connections.length === 0 ? (
        <div className="text-center py-16 px-4 bg-base-200/40 rounded-3xl border border-dashed border-base-300">
          <div className="text-5xl mb-3 animate-bounce">🔥</div>
          <h2 className="text-xl font-bold mb-2">No Matches Yet</h2>
          <p className="text-sm text-base-content/60 max-w-md mx-auto mb-6">
            Swipe right on profiles in your feed to start matching with developers around you!
          </p>
          <Link to="/" className="btn btn-primary rounded-xl gap-2 px-6">
            Explore Feed
          </Link>
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="text-center py-12 bg-base-200/20 rounded-2xl">
          <p className="text-sm text-base-content/70">
            No match matching "{searchTerm}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConnections.map((connection) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;

            return (
              <div
                key={_id}
                className="flex flex-col sm:flex-row items-center sm:items-start p-5 rounded-3xl bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 gap-4 group"
              >
                {/* Avatar */}
                <div className="avatar">
                  <div className="w-20 h-20 rounded-2xl ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100 overflow-hidden shrink-0">
                    <img
                      alt={`${firstName}'s photo`}
                      src={photoUrl || DEFAULT_USER_AVATAR}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = DEFAULT_USER_AVATAR;
                      }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h2 className="font-extrabold text-lg text-base-content truncate">
                    {firstName} {lastName}
                  </h2>

                  {(age || gender) && (
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start my-1.5">
                      {age && (
                        <span className="badge badge-xs badge-outline font-medium px-2 py-1.5 rounded-lg">
                          {age} yrs
                        </span>
                      )}
                      {gender && (
                        <span className="badge badge-xs badge-outline capitalize font-medium px-2 py-1.5 rounded-lg">
                          {gender}
                        </span>
                      )}
                      <span className="badge badge-xs badge-primary badge-outline font-medium px-2 py-1.5 rounded-lg">
                        Matched
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-base-content/70 line-clamp-2 mt-1">
                    {about || "Connected developer on Connexa."}
                  </p>
                </div>

                {/* Actions */}
                <div className="self-stretch sm:self-center flex sm:flex-col justify-end gap-2 shrink-0">
                  <Link to={"/chat/" + _id} className="w-full">
                    <button className="btn btn-primary btn-sm rounded-xl gap-2 w-full font-bold">
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
                      Message
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Connections;