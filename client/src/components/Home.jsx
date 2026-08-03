import React, { useEffect } from 'react';
import axios from "axios";
import Navbar from './Navbar';
import { Outlet, useNavigate, useLocation } from 'react-router';
import Footer from './Footer';
import { BASE_URL } from '../utils/constant';
import { addUser } from '../store/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import GlobalCallListener from './chat/GlobalCallListener';
import { createSocketConnection } from '../utils/socket';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err.status === 401) {
        navigate("/login");
      }
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userData) {
      const uid = userData._id || userData?.data?._id;
      if (uid) {
        const socket = createSocketConnection();
        socket.emit("joinUser", { userId: uid });
      }
    }
  }, [userData]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-base-100 text-base-content">
      <Navbar />

      {/* Global Call Notification Listener & Modal */}
      <GlobalCallListener />

      <main className="flex-grow relative flex flex-col">
        <Outlet />
      </main>

      {location.pathname === "/" && <Footer />}
    </div>
  );
};

export default Home;
