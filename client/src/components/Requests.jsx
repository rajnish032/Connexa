import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../store/requestSlice";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constant";
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
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Connection Requests
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          People who want to connect with you
        </p>
      </div>

      {(!requests || requests.length === 0) ? (
        <div className="text-center py-16 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold mb-2">No Pending Requests</h2>
          <p className="text-base-content/60 max-w-md mx-auto mb-6">
            You are all caught up! Check out new profiles on your feed to connect with others.
          </p>
          <Link to="/" className="btn btn-primary gap-2">
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
                className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-base-200/60 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 gap-4"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1 text-center sm:text-left min-w-0">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-2xl ring ring-secondary/20 ring-offset-2 ring-offset-base-100">
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

                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-lg text-base-content truncate">
                      {firstName + " " + lastName}
                    </h2>
                    {(age || gender) && (
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start my-1">
                        {age && <span className="badge badge-sm badge-outline">{age} yrs</span>}
                        {gender && <span className="badge badge-sm badge-outline capitalize">{gender}</span>}
                      </div>
                    )}
                    <p className="text-xs text-base-content/70 line-clamp-2 mt-1">
                      {about || "Wants to connect with you."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-base-300">
                  <button
                    className="btn btn-outline btn-error btn-sm flex-1 sm:flex-none"
                    onClick={() => reviewRequest("rejected", request._id)}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-primary btn-sm flex-1 sm:flex-none gap-1"
                    onClick={() => reviewRequest("accepted", request._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept
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