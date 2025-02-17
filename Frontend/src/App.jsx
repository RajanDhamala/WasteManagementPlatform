import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AlertContextProvider from './UserContext/AlertContext';
import Alert from './AiComponnets/Alert';
import Navbar from './Navbar';
import useUserContext from './hooks/useUserContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  LandingPage,
  EventSection,
  SlugEvent,
  Login,
  Register,
  Dashboard,
  VerifyUser,
  ForgotPassword,
  ScrappedNews,
} from './LazyLoading/Lazyloading';

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
  const { CurrentUser } = useUserContext();

  console.log(CurrentUser);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AlertContextProvider>
        <BrowserRouter>
          <Navbar />
          <Alert />
          <Suspense fallback={<Loader />}>
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
          </Suspense>
        </BrowserRouter>
      </AlertContextProvider>
    </QueryClientProvider>
  );
};

export default App;
