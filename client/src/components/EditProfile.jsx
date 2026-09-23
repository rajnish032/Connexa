import { useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser, removeUser } from "../store/userSlice";
import { BASE_URL, DEFAULT_USER_AVATAR } from "../utils/constant";
import { useNavigate, Link } from "react-router";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [about, setAbout] = useState(user?.about || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState("edit"); // 'edit' | 'preview'

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const saveProfile = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age: Number(age) || undefined,
          gender,
          about,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data || res?.data));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err) {
      setError(err?.response?.data || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 w-full min-h-[calc(100dvh-5rem)]">
      {/* Toast Alert */}
      {showToast && (
        <div className="toast toast-top toast-center z-50 animate-fade-in">
          <div className="alert alert-success shadow-lg border border-success/30 text-white rounded-2xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-sm">Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* Header Profile Hero Card */}
      <div className="bg-base-200/60 border border-base-300 rounded-3xl p-6 sm:p-8 mb-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          {/* Avatar Ring */}
          <div className="avatar">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100 shadow-xl overflow-hidden">
              <img
                src={photoUrl || DEFAULT_USER_AVATAR}
                alt={`${firstName}'s profile`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.src = DEFAULT_USER_AVATAR;
                }}
              />
            </div>
          </div>

          {/* Info & Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
                  {firstName} {lastName}
                </h1>
                <p className="text-xs text-base-content/60 mt-0.5">
                  {user?.emailId || "Developer on Connexa"}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Link to="/premium" className="btn btn-outline btn-secondary btn-xs rounded-xl gap-1">
                  ⭐ Premium
                </Link>
                <button onClick={handleLogout} className="btn btn-outline btn-error btn-xs rounded-xl">
                  Logout
                </button>
              </div>
            </div>

            {/* Quick Stats Pill Bar */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-4">
              {age && (
                <span className="badge badge-outline text-xs px-3 py-2 rounded-xl font-medium">
                  🎂 {age} yrs
                </span>
              )}
              {gender && (
                <span className="badge badge-outline text-xs px-3 py-2 rounded-xl font-medium capitalize">
                  👤 {gender}
                </span>
              )}
              <span className="badge badge-primary badge-outline text-xs px-3 py-2 rounded-xl font-medium">
                💻 Developer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher (Mobile Friendly Toggle) */}
      <div className="flex bg-base-200/70 p-1 rounded-2xl mb-6 max-w-md mx-auto sm:hidden">
        <button
          type="button"
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "edit"
              ? "bg-base-100 text-primary shadow-sm"
              : "text-base-content/60"
          }`}
          onClick={() => setActiveTab("edit")}
        >
          ✏️ Edit Details
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "preview"
              ? "bg-base-100 text-primary shadow-sm"
              : "text-base-content/60"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          👀 Card Preview
        </button>
      </div>

      {/* Content Grid (Edit Form + Live Card Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* EDIT FORM */}
        <div
          className={`lg:col-span-7 bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm ${
            activeTab === "preview" ? "hidden sm:block" : "block"
          }`}
        >
          <div className="border-b border-base-200 pb-4 mb-5 flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-base-content flex items-center gap-2">
              <span>✏️</span> Edit Personal Details
            </h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="label text-xs font-bold text-base-content/70">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  required
                  className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 text-sm rounded-xl"
                  placeholder="Elon"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="label text-xs font-bold text-base-content/70">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  required
                  className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 text-sm rounded-xl"
                  placeholder="Musk"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="label text-xs font-bold text-base-content/70">
                Profile Photo URL
              </label>
              <input
                type="text"
                value={photoUrl}
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 text-sm rounded-xl"
                placeholder="https://images.unsplash.com/..."
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <p className="text-[11px] text-base-content/50 mt-1">
                Paste an image link or leave blank to use the default avatar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="label text-xs font-bold text-base-content/70">
                  Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={age}
                  className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 text-sm rounded-xl"
                  placeholder="25"
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="label text-xs font-bold text-base-content/70">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="select select-bordered w-full bg-base-200/50 focus:bg-base-100 text-sm rounded-xl"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* About / Bio */}
            <div>
              <label className="label text-xs font-bold text-base-content/70">
                Bio / About You
              </label>
              <textarea
                value={about}
                rows={3}
                className="textarea textarea-bordered w-full bg-base-200/50 focus:bg-base-100 text-sm rounded-xl resize-none"
                placeholder="Tell other developers about yourself, your favorite tech stack, and what you build..."
                onChange={(e) => setAbout(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full rounded-xl text-sm font-bold gap-2 mt-4"
            >
              {loading && <span className="loading loading-spinner loading-xs"></span>}
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* LIVE CARD PREVIEW */}
        <div
          className={`lg:col-span-5 flex flex-col items-center justify-center ${
            activeTab === "edit" ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="w-full text-center mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-base-content/60">
              Live Feed Card Preview
            </h3>
          </div>

          <div className="w-full max-w-[360px] flex justify-center">
            <UserCard
              user={{
                firstName: firstName || "Your",
                lastName: lastName || "Name",
                photoUrl: photoUrl || DEFAULT_USER_AVATAR,
                age,
                gender,
                about: about || "Your bio will appear here on your Tinder-style card.",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;