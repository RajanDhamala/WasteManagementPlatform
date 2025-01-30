import React, { useState, useRef } from 'react';
import EventCard from './MainSections/EventCard';
import LandingPage from './MainSections/LandingPage';
import useUserContext from './hooks/useUserContext';
import EventSection from './MainSections/EventSection';
import { BrowserRouter,Routes,Route,Link } from 'react-router-dom';
import Navbar from './Navbar';
import SlugEvent from './MainSections/SlugEvent';

const App = () => {

  return (
    <>
   <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventSection />} />
          <Route path="/events/:title" element={<SlugEvent />} />
        </Routes>
      </BrowserRouter>
   </div>
    </>
  );
};



export default App;