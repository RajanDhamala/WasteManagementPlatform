import { create } from 'zustand'

const useStore =create((set)=>({
    CurrentUser:null,
    setCurrentUser:(value)=>set({CurrentUser:value}),
    clearCurrentUser:()=>set({CurrentUser:null}),

    alert:null,
    setAlert:(value)=>set({alert:value}),
    clearAlert:()=>set({alert:null})
}))


export default useStore