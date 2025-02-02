import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import UserContextProvider from './UserContext/UserContext.jsx'
import FramerMotion from './FramerMotion.jsx'
import ScrollAnimination
 from './ScrollAnimination.jsx'
import EventCard from './MainSections/EventCard.jsx'
import LandingPage from './MainSections/LandingPage.jsx'


createRoot(document.getElementById('root')).render(

    <UserContextProvider>
      <FramerMotion/>
    </UserContextProvider>
,
)
