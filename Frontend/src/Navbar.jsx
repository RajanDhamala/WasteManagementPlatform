import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  X, 
  Home, 
  LogIn, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import useStore from "./ZustandStore/UserStore";

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const CurrentUser=useStore((state)=>state.CurrentUser)
  const clearCurrentUser=useStore((state)=>state.clearCurrentUser)
  console.log(CurrentUser)


  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Community", path: "/community", icon: Users },
    { name: "Settings", path: "/settings", icon: Settings },
  ];
  
  const authItems = [
    { name: "Profile", path: "/profile", icon: User },
    { name: "Login", path: "/login", icon: LogIn },
    { name: "Register", path: "/register", icon: UserPlus }
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };


  const LogoutUser = async () => {
    try {
      const response = await axios.get("http://localhost:8000/user/logout", {
        withCredentials: true,
      });
      console.log(response)
      if (response.status =="200") {
        clearCurrentUser()
        window.location.reload();
        
      }
    } catch (err) {
      console.error(err, "Error logging out");
    }
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg z-50 flex items-center justify-between px-4 h-16 md:hidden"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center">
          
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-10 h-10 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-md">
            <User className="h-5 w-5 text-green-600" />
          </Link>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center shadow-md hover:bg-green-700 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed top-16 right-4 w-72 max-h-[80vh] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-40 overflow-hidden rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 md:hidden"
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
              <div className="p-3">
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm p-4 mb-4 shadow-md">
                  <div className="flex items-center space-x-3">                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-green-600/90 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {CurrentUser?.ProfileImage ? (
                        <img src={CurrentUser.ProfileImage} alt={CurrentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{CurrentUser?.name || 'Guest'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mb-4">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold px-2 mb-2">Navigation</h3>
                  {menuItems.map((item) => (
                    <div key={item.name}>
                      <Link
                        to={item.path}
                        className={`flex items-center py-2.5 px-4 rounded-xl transition-all ${
                          isActive(item.path) 
                            ? "bg-green-600/90 text-white shadow-md backdrop-blur-sm" 
                            : "hover:bg-gray-100/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:shadow-md"
                        }`}
                        onClick={() => {
                          console.log(`Navigating to: ${item.path}`); // Debug log
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-white" : "text-green-600 dark:text-green-400"}`} />
                        <span className="ml-3 font-medium">{item.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold px-2 mb-2">Account</h3>
                  {authItems.map((item) => (
                    <div key={item.name}>
                      <Link
                        to={item.path}
                        className={`flex items-center py-3 px-4 rounded-xl transition-all ${
                          isActive(item.path) 
                            ? "bg-green-600/90 text-white shadow-md backdrop-blur-sm" 
                            : "hover:bg-gray-100/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:shadow-md"
                        }`}
                        onClick={() => {
                          console.log(`Navigating to: ${item.path}`); // Debug log
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-white" : "text-green-600 dark:text-green-400"}`} />
                        <span className="ml-3 font-medium">{item.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 border-t border-gray-200/20 dark:border-gray-700/20 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    LogoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-red-500/90 hover:bg-red-600/90 text-white rounded-lg flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:shadow-lg"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-md z-50  flex-col hidden md:flex
          ${isCollapsed ? 'w-16' : 'w-64'}`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <motion.button
            onClick={toggleSidebar}
            className={`${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </motion.button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="p-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => {
                  if (item.path === location.pathname) {
                    e.preventDefault();
                    return;
                  }
                }}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } ${isCollapsed ? 'p-2' : 'py-3 px-4'} rounded-lg transition-all mb-1 group relative hover:shadow-md ${
                  isActive(item.path)
                    ? 'bg-green-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className={`${isCollapsed ? 'h-8 w-8' : 'h-6 w-6'} ${
                  isActive(item.path) ? 'text-white' : 'text-green-600'
                } transition-all`} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`ml-3 whitespace-nowrap ${
                      isActive(item.path) ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            ))}

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-3" />

            {authItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } ${isCollapsed ? 'p-2' : 'py-3 px-4'} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all mb-1 group relative hover:shadow-md`}
              >
                <item.icon className={`${isCollapsed ? 'h-8 w-8' : 'h-6 w-6'} text-green-600 transition-all`} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3 text-gray-700 dark:text-gray-200 whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-2">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>            <div className={`${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-full overflow-hidden transition-all`}>
              {CurrentUser?.ProfileImage ? (
                <img src={CurrentUser.ProfileImage} alt={CurrentUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <User className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} text-gray-700 dark:text-gray-300 transition-all`} />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3"
              >
                <div className="font-medium text-gray-700 dark:text-gray-200">{CurrentUser?.name || 'Guest'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">User</div>
              </motion.div>
            )}
          </div>
          <motion.button
            onClick={LogoutUser}
            className={`mt-3 bg-red-500 hover:bg-red-600 text-white rounded-lg 
              ${isCollapsed ? 'w-10 h-10 flex items-center justify-center mx-auto' : 'w-full py-2'}`}
            whileTap={{ scale: 0.95 }}
          >
            <X className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2 inline'}`} />
            {!isCollapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </motion.div>

      {/* Content area */}
      <div className="pt-16 md:pt-4 md:ml-16 lg:ml-16 transition-all duration-300" style={{ marginLeft: isCollapsed ? 'calc(4rem + 1px)' : 'calc(16rem + 1px)' }}>
        {/* Your page content */}
      </div>
    </>
  );
};

export default Navbar;