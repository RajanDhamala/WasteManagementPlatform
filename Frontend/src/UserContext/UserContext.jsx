import { useContext, createContext, useState } from "react";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState("landing");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [CurrentUser,setCurrentUser] = useState(null);
  const [isLoggedIn,setisLoggedIn] = useState(false);

  return (
    <UserContext.Provider
      value={{
        selectedTab,
        setSelectedTab,
        isMenuOpen,
        setIsMenuOpen,
        CurrentUser,
        setCurrentUser,
        isLoggedIn,
        setisLoggedIn
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
