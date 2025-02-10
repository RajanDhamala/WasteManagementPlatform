import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import UserContextProvider from './UserContext/UserContext.jsx'
import StreamsData from './StreamsData.jsx'


createRoot(document.getElementById('root')).render(

    <UserContextProvider>
      <StreamsData/>
    </UserContextProvider>
,
)
