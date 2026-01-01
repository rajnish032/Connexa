import React, { useEffect } from 'react'
import axios from "axios"
import Navbar from './Navbar';
import { Outlet, useNavigate } from 'react-router';
import Footer from './Footer';
import { BASE_URL } from '../utils/constant';
import { addUser } from '../store/userSlice';
import { useDispatch, useSelector } from 'react-redux';

const Home = () => {


  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  return (
  <div className="min-h-screen flex flex-col">
    <Navbar />

    <main className="flex-grow">
      <Outlet />
    </main>

    <Footer />
  </div>
);

}

export default Home;
