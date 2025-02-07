import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AlertContextProvider from './UserContext/AlertContext';
import Alert from './AiComponnets/Alert'; 
import Navbar from './Navbar';
import {Suspense} from 'react'

import{LandingPage,EventSection,SlugEvent,Login,Register,Dashboard,VerifyUser,ForgotPassword,ScrappedNews,ComminitySection} from './LazyLoading/Lazyloading'


const Loader=(()=>{
  return(
    <>
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    </>
  )
})

const App = () => {
  return (
    <AlertContextProvider>
      <BrowserRouter>
        <Navbar />
        <Alert /> 
        <Suspense fallback={<Loader/>}>
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
          <Route path="/Community" element={<ComminitySection />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AlertContextProvider>
  );
};

export default App;
