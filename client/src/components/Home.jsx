import React, { useEffect, useState } from 'react';
import axios from "axios";
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import InstallPWA from './InstallPWA';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { BASE_URL } from '../utils/constant';
import { addUser, removeUser } from '../store/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import GlobalCallListener from './chat/GlobalCallListener';
import { createSocketConnection } from '../utils/socket';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const [isAuthChecking, setIsAuthChecking] = useState(!userData);

  const fetchUser = async () => {
    if (userData) {
      setIsAuthChecking(false);
      return;
    }
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err?.response?.status === 401 || err?.status === 401) {
        dispatch(removeUser());
      }
    } finally {
      setIsAuthChecking(false);
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
    <div className="min-h-screen min-h-[100dvh] flex flex-col relative overflow-x-hidden bg-base-100 text-base-content">
      <Navbar />

      {/* Global Call Notification Listener & Modal */}
      <GlobalCallListener />

      <main className="flex-grow relative flex flex-col pb-16 md:pb-0">
        <Outlet context={{ isAuthChecking }} />
      </main>

      {/* PWA Install Banner */}
      <InstallPWA />

      {/* Mobile Fixed Bottom Navigation Bar (Instagram/Tinder style) */}
      <BottomNav />
    </div>
  );
};

export default Home;
