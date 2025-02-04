import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import LandingPage from './MainSections/LandingPage';
import EventSection from './MainSections/EventSection';
import SlugEvent from './MainSections/SlugEvent';
import ScrappedNews from './MainSections/ScrappedNews';
import Login from './Authencation/Login';
import Register from './Authencation/Register';
import Dashboard from './Authencation/Dashboard';
import ForgotPassword from './Authencation/FogotPassword';
import VerifyUser from './Authencation/VerifyUser';
import AlertContextProvider from './UserContext/AlertContext'; // Import context provider
import Alert from './AiComponnets/Alert'; // Import alert component

const App = () => {
  return (
    <AlertContextProvider>
      <BrowserRouter>
        <Navbar />
        <Alert /> {/* Alert component is now globally accessible */}

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
    </AlertContextProvider>
  );
};

export default App;
