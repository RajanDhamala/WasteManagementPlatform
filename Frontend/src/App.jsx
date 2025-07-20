import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Alert from "./AiComponnets/Alert";
import Navbar from "./Navbar";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import TanStack from "./TanStack";
import {LandingPage,EventSection,SlugEvent,Login,Register,Dashboard,VerifyUser,ForgotPassword,ScrappedNews,ComminitySection,EventReportSection,} from "./LazyLoading/Lazyloading";
import Cookies from "js-cookie";
import CreateReport from "./MainSections/CreateReport";
import QrCode from "./MainSections/QrCode";
import ChatApp from "./MainSections/QrGetter";
import ProtectedRoute from "./Authencation/AuthControl";
import useStore from "./ZustandStore/UserStore";
import useSocket from "./ZustandStore/SocketStore";
import VideoChat from "./MainSections/VideoCall";
import Trial from "./Trial";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    },
  },
});

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

const App = () => {
const setCurrentUser = useStore((state) => state.setCurrentUser);
const socket = useSocket((state) => state.socket);
const socketId = useSocket((state) => state.socketId);
const connect = useSocket((state) => state.connect);
const disconnect = useSocket((state) => state.disconnect);
const isConnecting = useSocket((state) => state.isConnecting);

useEffect(() => {
  const user = Cookies.get("CurrentUser");
  if (user) {
    try {
      setCurrentUser(JSON.parse(user));
    } catch (error) {
      console.error("Error parsing user:", error);
    }
  }
}, []);

useEffect(() => {
  if (!socket && !isConnecting) {
    connect('http://localhost:8000');
  }
}, [socket, isConnecting, connect]); //



  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false}/>
      <BrowserRouter>
        <Alert />
        <Navbar/>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<EventSection />} />
            <Route path="/events/:title" element={<SlugEvent />} />
            <Route path="/scrapnews" element={<ScrappedNews />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/verify" element={<VerifyUser />} />
            <Route path="/community" element={<ComminitySection />} />
            <Route path="/tanstack" element={<TanStack />} />
            <Route path="/eventreport/:title" element={<ProtectedRoute><EventReportSection/></ProtectedRoute>} />
            <Route path='/makereport' element={<CreateReport/>}></Route>
            <Route path={'/scan'} element={<QrCode/>}> </Route>
            <Route path={'/qr'} element={<ChatApp/>}> </Route>
             <Route path={'/call'} element={<VideoChat/>}> </Route>
             <Route path={'/trial'} element={<Trial/>}></Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
