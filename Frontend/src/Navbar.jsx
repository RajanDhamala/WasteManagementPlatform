import { useState,useEffect,useRef } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, X, Home, LogIn, UserPlus, ChevronUp } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import axios from "axios";
import { createPortal } from "react-dom";

const Navbar = () => {
  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Community", path: "/community", icon: Users },
    { name: "Profile", path: "/profile", icon: Users },  // Always available
    { name: "Login", path: "/login", icon: LogIn },      // For non-logged-in users
    { name: "Register", path: "/register", icon: UserPlus }  // For non-logged-in users
  ];

  const LogoutUser = async () => {
    try {
      const response = await axios.get("http://localhost:8000/user/logout", {
        withCredentials: true,
      });
      if (response.data.statusCode === "200") {
        window.location.reload();
      }
    } catch (err) {
      console.error(err, "Error logging out");
    }
  };

  return (
    // Rendering the Navbar inside a React Portal
    <NavbarPortal>
      <FloatingDock items={menuItems} onLogout={LogoutUser} />
    </NavbarPortal>
  );
};

// React Portal component
const NavbarPortal = ({ children }) => {
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    const element = document.createElement("div");
    element.id = "navbar-portal-root";
    document.body.appendChild(element);
    setPortalRoot(element);

    return () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  return portalRoot ? createPortal(children, portalRoot) : null;
};

// FloatingDock Component (for both Mobile and Desktop)
const FloatingDock = ({ items, onLogout }) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center z-50  max-w-[90%] rounded-xl shadow-lg">
      {/* Mobile Dock */}
      <MobileDock items={items} onLogout={onLogout} />

      {/* Desktop Dock */}
      <DesktopDock items={items} onLogout={onLogout} />
    </div>
  );
};

const MobileDock = ({ items, onLogout }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="block md:hidden relative">
      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="mobile-nav"
            className="absolute bottom-full mb-2 w-full flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <Link 
                  to={item.path} 
                  className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-900 shadow-md flex items-center justify-center"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5 text-green-600" />
                </Link>
              </motion.div>
            ))}
            <button 
              onClick={() => {
                onLogout();
                setOpen(false);
              }} 
              className="h-10 w-10 rounded-full bg-red-500 shadow-md flex items-center justify-center"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Toggle Button */}
      <motion.button 
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-green-600 shadow-lg flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronUp className="h-6 w-6 text-white" />
      </motion.button>
    </div>
  );
};

const DesktopDock = ({ items, onLogout }) => {
  let mouseX = useMotionValue(Infinity);
  
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="hidden md:flex h-16 gap-4 items-end rounded-2xl bg-gray-50 dark:bg-neutral-900 px-4 pb-3 shadow-lg"
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.name} {...item} />
      ))}
      <button 
        onClick={onLogout} 
        className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center transition-transform hover:scale-105"
      >
        <X className="h-6 w-6 text-white" />
      </button>
    </motion.div>
  );
};

function IconContainer({ mouseX, name, icon: Icon, path }) {
  let ref = useRef(null);
  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let sizeTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let iconSizeTransform = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let size = useSpring(sizeTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  let iconSize = useSpring(iconSizeTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <Link 
      to={path} 
      ref={ref} 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
      className="group"
    >
      <motion.div 
        style={{ width: size, height: size }} 
        className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative transition-colors hover:bg-gray-300 dark:hover:bg-neutral-700"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div 
              initial={{ opacity: 0, y: 10, x: "-50%" }} 
              animate={{ opacity: 1, y: 0, x: "-50%" }} 
              exit={{ opacity: 0, y: 2, x: "-50%" }} 
              className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 text-xs absolute left-1/2 -translate-x-1/2 -top-8 z-10"
            >
              {name}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: iconSize, height: iconSize }}>
          <Icon className="text-green-600" />
        </motion.div>
      </motion.div>
    </Link>
  );
}

export default Navbar;
