import {lazy} from 'react'

export const ScrappedNews=lazy(()=>import('../MainSections/ScrappedNews'))
export const LandingPage=lazy(()=>import('../MainSections/LandingPage'))
export const EventSection=lazy(()=>import('../MainSections/EventSection'))
export const SlugEvent=lazy(()=>import('../MainSections/SlugEvent'))
export const Login=lazy(()=>import('../Authencation/Login'))
export const Register=lazy(()=>import('../Authencation/Register'))
export const Dashboard=lazy(()=>import('../Authencation/Dashboard'))
export const VerifyUser=lazy(()=>import('../Authencation/VerifyUser'))
export const ForgotPassword=lazy(()=>import('../Authencation/FogotPassword'))
export const ComminitySection=lazy(()=>import('../MainSections/ComminityDiscussion'))
export const EventReportSection=lazy(()=>import('../MainSections/EventReportSection'))


