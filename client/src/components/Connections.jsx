import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../store/connectionSlice";
import { BASE_URL } from "../utils/constant";
import { Link } from "react-router";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
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
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const filteredConnections = (connections || []).filter((conn) => {
    const fullName = `${conn.firstName || ""} ${conn.lastName || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Connections
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            People you have connected with on Connexa
          </p>
        </div>

        {connections && connections.length > 0 && (
          <div className="form-control w-full sm:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pr-10 bg-base-200/50 focus:bg-base-100 transition-all"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"
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

      {(!connections || connections.length === 0) ? (
        <div className="text-center py-16 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-xl font-bold mb-2">No Connections Yet</h2>
          <p className="text-base-content/60 max-w-md mx-auto mb-6">
            Explore users in your feed and connect with people who share your interests!
          </p>
          <Link to="/" className="btn btn-primary gap-2">
            Explore Feed
          </Link>
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="text-center py-12 bg-base-200/20 rounded-xl">
          <p className="text-base-content/70">No connection matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConnections.map((connection) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;

            return (
              <div
                key={_id}
                className="flex flex-col sm:flex-row items-center sm:items-start p-5 rounded-2xl bg-base-200/60 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 gap-4"
              >
                <div className="avatar">
                  <div className="w-20 h-20 rounded-2xl ring ring-primary/20 ring-offset-2 ring-offset-base-100">
                    <img
                      alt={`${firstName}'s photo`}
                      src={photoUrl || "https://geographyandthemotive.org/wp-content/uploads/2018/04/dummy-user-img.png"}
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = "https://geographyandthemotive.org/wp-content/uploads/2018/04/dummy-user-img.png";
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h2 className="font-bold text-lg text-base-content truncate">
                    {firstName + " " + lastName}
                  </h2>

                  {(age || gender) && (
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start my-1.5">
                      {age && <span className="badge badge-sm badge-outline">{age} yrs</span>}
                      {gender && <span className="badge badge-sm badge-outline capitalize">{gender}</span>}
                    </div>
                  )}

                  <p className="text-xs text-base-content/70 line-clamp-2 mt-1">
                    {about || "No description provided."}
                  </p>
                </div>

                <div className="self-stretch sm:self-center flex sm:flex-col justify-end">
                  <Link to={"/chat/" + _id} className="w-full">
                    <button className="btn btn-primary btn-sm gap-2 w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chat
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