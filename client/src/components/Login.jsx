import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useNavigate } from "react-router";
import { BASE_URL } from "../utils/constant";
import AnimatedBackground from "./AnimatedBackground";

const Login = () => {
  const [emailId, setEmailId] = useState("rajnish.dev@example.com");
  const [password, setPassword] = useState("Test@1234");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      console.log(res.data)
      dispatch(addUser(res.data))
      return navigate('/');
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
      //console.error(err);
    }
  };

  const handleSignUp = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      return navigate("/profile");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  return (
    
    <div className="flex justify-center p-5 m-5">
      <AnimatedBackground />
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend text-center text-2xl text-gray-500">
          {isLoginForm ? "Login!" : "SignUp!"}
        </legend>

        {!isLoginForm && (
          <>
          <label className="label">First Name</label>
        <input
          type="text"
          value={firstName}
          className="input"
          placeholder="Elon"
          onChange={(e) => setFirstName(e.target.value)}
        />
         <label className="label">Last Name</label>
        <input
          type="text"
          value={lastName}
          className="input"
          placeholder="Musk"
          onChange={(e) => setLastName(e.target.value)}
        />
          </>
        )}

        <label className="label">Email</label>
        <input
          type="email"
          value={emailId}
          className="input"
          placeholder="Email"
          onChange={(e) => setEmailId(e.target.value)}
        />

        <label className="label">Password</label>
        <input
          type="password"
          value={password}
          className="input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
       <p className="text-red-500">{error}</p>
        <button
          type="button"
          className="btn btn-neutral mt-4"
          onClick={ isLoginForm? handleLogin : handleSignUp}
        >
        {isLoginForm ? "Login" : "Sign Up"}
        </button>
        <p className="m-auto cursor-pointer py-2" onClick={() => setIsLoginForm((value) => !value)}> 
          {isLoginForm ? "New User ? SignUp Here" : "Existing User? Login Here"} </p>
      </fieldset>
    </div>
  );
};

export default Login;
