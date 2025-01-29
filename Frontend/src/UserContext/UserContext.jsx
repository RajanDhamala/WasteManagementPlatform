import { useContext, createContext, useState } from "react";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState("landing");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedTab,
        setSelectedTab,
        isMenuOpen,
        setIsMenuOpen,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
