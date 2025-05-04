import cookie from 'cookie'

const SocketMiddle = (socket, next) => {
    const rawCookies = socket.handshake.headers.cookie;
    if (!rawCookies) {
      console.warn("⚠️ No cookies found for socket:", socket.id);
      return next(new Error("No cookies found"));
    }
  
    const parsedCookies = cookie.parse(rawCookies || "");
    let currentUser = null;
  
    if (parsedCookies.CurrentUser) {
      try {
        currentUser = JSON.parse(parsedCookies.CurrentUser);
      } catch (error) {
        console.error("❌ Error parsing CurrentUser cookie:", error);
        return next(new Error("Error parsing cookie"));
      }
    }
  
    if (currentUser && currentUser.username) {
      socket.username = currentUser.username; 
      return next();
    } else {
      console.warn("⚠️ No username found in CurrentUser cookie for socket:", socket.id);
      return next(new Error("Username not found in cookie"));
    }
  };
  
export default SocketMiddle;
  