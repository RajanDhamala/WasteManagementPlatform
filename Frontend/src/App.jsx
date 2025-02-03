import React, { useState, useRef } from 'react';
import EventCard from './MainSections/EventCard';
import LandingPage from './MainSections/LandingPage';
import useUserContext from './hooks/useUserContext';
import EventSection from './MainSections/EventSection';
import { BrowserRouter,Routes,Route,Link } from 'react-router-dom';
import Navbar from './Navbar';
import SlugEvent from './MainSections/SlugEvent';
import ScrappedNews from './MainSections/ScrappedNews';
import Login from './Authencation/Login';
import Register from './Authencation/Register';
import Dashboard from './Authencation/Dashboard';
import ForgotPassword from './Authencation/FogotPassword';
import VerifyUser from './Authencation/VerifyUser';

const App = () => {
  return (
    <>
   <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<EventSection />} />
          <Route path="/events/:title" element={<SlugEvent />} />
          <Route path="/scrapnews" element={<ScrappedNews />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/verify" element={<VerifyUser />} />
        </Routes>
      </BrowserRouter>
   </div>
    </>
  );
};

export default App;