import { createContext,useContext,useState } from "react";

const AlertContext = createContext();
const AlertContextProvider=({children})=>{

    const [alert,setAlert]=useState(null);
    return(
        <AlertContext.Provider value={{alert,setAlert}}>
            {children}
        </AlertContext.Provider>
    )
}

export const useAlert=()=>{
    return useContext(AlertContext);
}

export default AlertContextProvider;