import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../store/requestSlice";
import { useEffect, useState } from "react";
import { BASE_URL, DEFAULT_USER_AVATAR } from "../utils/constant";
import { Link } from "react-router";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {
      console.error("Failed to review request:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading && !requests) {
    return (
      <div className="flex flex-col justify-center items-center py-20 min-h-[50vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm font-medium text-base-content/60 animate-pulse">
          Fetching pending requests...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 w-full">
      {/* Page Title & Count Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Connection Requests
            </h1>
            {requests && requests.length > 0 && (
              <span className="badge badge-primary font-bold text-xs animate-pulse">
                {requests.length}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            People who want to connect and build with you
          </p>
        </div>
      </div>

      {/* Empty State */}
      {!requests || requests.length === 0 ? (
        <div className="text-center py-16 px-4 bg-base-200/40 rounded-3xl border border-dashed border-base-300">
          <div className="text-5xl mb-3">📬</div>
          <h2 className="text-xl font-bold mb-2">No Pending Requests</h2>
          <p className="text-sm text-base-content/60 max-w-md mx-auto mb-6">
            You are all caught up! Explore new developer profiles on your feed to make new connections.
          </p>
          <Link to="/" className="btn btn-primary rounded-xl gap-2 px-6">
            Go to Feed
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            if (!request?.fromUserId) return null;
            const { _id: userId, firstName, lastName, photoUrl, age, gender, about } = request.fromUserId;

            return (
              <div
                key={request._id}
                className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-3xl bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 gap-4"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1 text-center sm:text-left min-w-0">
                  <div className="avatar shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-2 ring-secondary/30 ring-offset-2 ring-offset-base-100 overflow-hidden">
                      <img
                        alt={`${firstName}'s photo`}
                        src={photoUrl || DEFAULT_USER_AVATAR}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.src = DEFAULT_USER_AVATAR;
                        }}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
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
                        <span className="badge badge-xs badge-secondary badge-outline font-medium px-2 py-1.5 rounded-lg">
                          Interested in you
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-base-content/70 line-clamp-2 mt-1">
                      {about || "Wants to connect with you on Connexa."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-base-200 shrink-0">
                  <button
                    className="btn btn-outline btn-error btn-sm rounded-xl flex-1 sm:flex-none font-semibold px-4"
                    onClick={() => reviewRequest("rejected", request._id)}
                  >
                    Decline
                  </button>
                  <button
                    className="btn btn-primary btn-sm rounded-xl flex-1 sm:flex-none gap-1.5 font-bold px-5"
                    onClick={() => reviewRequest("accepted", request._id)}
                  >
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
                        strokeWidth="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Accept Match
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Requests;