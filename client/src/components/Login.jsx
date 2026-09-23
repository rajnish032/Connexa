import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { clearFeed } from "../store/feedSlice";
import { useNavigate } from "react-router";
import { BASE_URL } from "../utils/constant";
import AnimatedBackground from "./AnimatedBackground";

const Login = () => {
  const [emailId, setEmailId] = useState("vishnu@gmail.com");
  const [password, setPassword] = useState("Test@1234");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      dispatch(clearFeed());
      return navigate("/");
    } catch (err) {
      setError(err?.response?.data || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      dispatch(clearFeed());
      return navigate("/profile");
    } catch (err) {
      setError(err?.response?.data || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md bg-base-100/75 backdrop-blur-xl border border-base-300 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 transition-all duration-300">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2 inline-block animate-bounce">👦🏻</div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isLoginForm ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            {isLoginForm
              ? "Sign in to connect with developers around you"
              : "Join Connexa and expand your tech network"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-base-200/70 p-1 rounded-2xl mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              isLoginForm
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
            onClick={() => {
              setIsLoginForm(true);
              setError("");
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              !isLoginForm
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
            onClick={() => {
              setIsLoginForm(false);
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            isLoginForm ? handleLogin() : handleSignUp();
          }}
          className="space-y-4"
        >
          {!isLoginForm && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs font-semibold text-base-content/70">
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
              <div>
                <label className="label text-xs font-semibold text-base-content/70">
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
          )}

          <div>
            <label className="label text-xs font-semibold text-base-content/70">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailId}
                required
                className="input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 text-sm rounded-xl"
                placeholder="name@example.com"
                onChange={(e) => setEmailId(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
          </div>

          <div>
            <label className="label text-xs font-semibold text-base-content/70">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                required
                className="input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 text-sm rounded-xl"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full rounded-xl text-sm font-bold gap-2 mt-2"
          >
            {loading && <span className="loading loading-spinner loading-xs"></span>}
            {isLoginForm ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Footer Toggle text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-base-content/60">
            {isLoginForm ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-primary font-bold hover:underline ml-1"
              onClick={() => {
                setIsLoginForm(!isLoginForm);
                setError("");
              }}
            >
              {isLoginForm ? "Sign Up now" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
