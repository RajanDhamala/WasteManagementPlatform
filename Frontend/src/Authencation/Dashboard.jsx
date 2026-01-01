import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import moment from "moment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User,MapPin,Calendar,Settings,Camera,Activity,ChevronRight,LogOut,Coffee,Clock,Edit3,Heart,Star,TrendingUp,Users,Award,Sparkles,} from "lucide-react"
import useStore from "@/ZustandStore/UserStore"

const Dashboard = () => {
  const [joinedEvents, setJoinedEvents] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    birthdate: "",
    ProfileImage: null,
  })
  const [preview, setPreview] = useState(null)

  const setAlert = useStore((state) => state.setAlert)

  useEffect(() => {
    fetchUser()
  }, [])

  const showJoinedEvents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}user/joinedevents`, {
        withCredentials: true,
      })

      if (response.data.statusCode === 200) {
        setJoinedEvents(response.data.data)
        setAlert({
          type: "success",
          message: response.data.message,
          title: "Joined Events",
        })
      } else {
        setAlert({
          type: "error",
          message: response.data.message,
          title: "Joined Events",
        })
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: "Failed to fetch joined events",
        title: "Error",
      })
    }
  }

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user/profile", {
        withCredentials: true,
      })

      if (res.data.statusCode === 200) {
        setUser(res.data.data)
        setFormData({
          bio: res.data.data.bio || "",
          location: res.data.data.location || "",
          birthdate: res.data.data.birthdate ? moment(res.data.data.birthdate).format("YYYY-MM-DD") : "",
          ProfileImage: res.data.data.ProfileImage || null,
        })
      } else {
        setAlert({
          type: "error",
          message: res.data.message,
          title: "Profile",
        })
      }
      setLoading(false)
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to fetch user profile",
        title: "Error",
      })
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
      setPreview(URL.createObjectURL(files[0]))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:8000/user/logout", {
        withCredentials: true,
      })

      setAlert({
        type: "success",
        message: response.data.message,
        title: "Logout",
      })

      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to logout",
        title: "Error",
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    const updatedData = new FormData()

    Object.keys(formData).forEach((key) => {
      if (key === "ProfileImage" && formData[key] instanceof File) {
        updatedData.append(key, formData[key])
      } else if (key !== "ProfileImage") {
        updatedData.append(key, formData[key])
      }
    })

    try {
      const res = await axios.post("http://localhost:8000/user/UpdateProfile", updatedData, {
        withCredentials: true,
      })

      if (res.data.statusCode === 200) {
        setUser(res.data.data)
        setOpen(false)
        setAlert({
          type: "success",
          message: res.data.message,
          title: "Update",
        })
      } else {
        setAlert({
          type: "error",
          message: res.data.message,
          title: "Update",
        })
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to update profile",
        title: "Error",
      })
    }
  }

  const leaveEvent = async (eventTitle) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}user/leaveEvent`,
        {
          eventId: eventTitle,
        },
        {
          withCredentials: true,
        },
      )

      if (response.data.statusCode === 200) {
        setAlert({
          type: "success",
          message: response.data.message,
          title: "Leave Event",
        })
        setJoinedEvents((prev) => prev.filter((event) => event.title !== eventTitle))
      } else {
        setAlert({
          type: "error",
          message: response.data.message,
          title: "Leave Event",
        })
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: "Failed to leave event",
        title: "Error",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
            }}
            className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Dashboard</h3>
            <p className="text-slate-600">Preparing your personalized experience...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-slate-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
              <Activity className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Enhanced Sidebar */}
          <motion.div
            className="lg:col-span-4 xl:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50/50 border-slate-200/60 shadow-xl shadow-slate-200/20">
                <CardContent className="p-0">
                  {/* Cover Background */}
                  <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>

                  {/* Profile Content */}
                  <div className="px-6 pb-6 -mt-12 relative">
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        className="relative group mb-4"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                          <img
                            src={preview || user?.ProfileImage || "/placeholder.svg?height=150&width=150"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Camera className="text-white w-6 h-6" />
                        </motion.div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center ring-3 ring-white">
                          <Star className="w-4 h-4 text-white fill-current" />
                        </div>
                      </motion.div>

                      <h2 className="text-xl font-bold text-slate-800 mb-1">{user?.name}</h2>
                      <p className="text-slate-600 text-sm mb-4">{user?.email}</p>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setOpen(true)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/50 border-0"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-200/20">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {[
                      { icon: User, label: "Profile", color: "text-slate-600" },
                      { icon: Settings, label: "Settings", color: "text-slate-600" },
                      { icon: Coffee, label: "Joined Events", color: "text-emerald-600", action: showJoinedEvents },
                    ].map((item, index) => (
                      <motion.button
                        key={item.label}
                        onClick={item.action}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl ${item.color} hover:bg-slate-50 transition-all duration-200 group`}
                        whileHover={{ x: 4 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}

                    <Separator className="my-3" />

                    <motion.button
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
                      onClick={handleLogout}
                      whileHover={{ x: 4 }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-emerald-800">Quick Stats</h3>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-700">Events Joined</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {joinedEvents.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-700">Profile Complete</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        85%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-8 xl:col-span-9"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="space-y-8">
              {/* Profile Overview */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-200/20">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
                        <Award className="w-6 h-6 text-emerald-600" />
                        Profile Overview
                      </CardTitle>
                      <p className="text-slate-600 mt-1">Your personal information and preferences</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/60 hover:shadow-lg hover:shadow-violet-200/25 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3 text-violet-600 mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold">About Me</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {user?.bio || "Tell us about yourself and what makes you unique..."}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/60 hover:shadow-lg hover:shadow-rose-200/25 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3 text-rose-600 mb-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold">Location</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {user?.location || "Share your location to connect with nearby events..."}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 hover:shadow-lg hover:shadow-amber-200/25 transition-all duration-300 md:col-span-2 xl:col-span-1"
                    >
                      <div className="flex items-center space-x-3 text-amber-600 mb-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold">Member Since</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {user?.birthdate
                          ? moment(user.birthdate).format("MMMM DD, YYYY")
                          : "Add your birthdate to personalize your experience..."}
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-200/20">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      { icon: User, action: "Profile updated", time: 1, color: "emerald" },
                      { icon: Heart, action: "Joined new event", time: 2, color: "rose" },
                      { icon: Settings, action: "Settings modified", time: 3, color: "violet" },
                    ].map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-xl bg-${activity.color}-100 flex items-center justify-center text-${activity.color}-600 group-hover:scale-110 transition-transform`}
                          >
                            <activity.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-slate-800 font-medium">{activity.action}</p>
                            <p className="text-slate-500 text-sm">
                              {moment().subtract(activity.time, "days").format("MMMM D, YYYY")}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Joined Events Section */}
        <motion.section
          className="mt-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <AnimatePresence>
            {joinedEvents.length > 0 ? (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    Your Events
                  </h2>
                  <p className="text-slate-600">Events you've joined and are participating in</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {joinedEvents.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="group"
                    >
                      <Card className="overflow-hidden bg-white border-slate-200/60 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300">
                        <div className="relative overflow-hidden">
                          <img
                            src={event.EventImg || "/placeholder.svg?height=200&width=300"}
                            alt={event.title}
                            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-emerald-500 text-white border-0">{event.EventStatus}</Badge>
                          </div>
                        </div>

                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-emerald-600 transition-colors">
                            {event.title}
                          </h3>

                          <div className="space-y-3 mb-6">
                            {[
                              { icon: Calendar, label: "Date", value: moment(event.date).format("DD MMMM YYYY") },
                              { icon: Clock, label: "Time", value: event.time },
                              { icon: MapPin, label: "Location", value: event.location },
                            ].map((detail, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <detail.icon className="w-4 h-4" />
                                  <span className="text-sm">{detail.label}:</span>
                                </div>
                                <span className="font-medium text-slate-800 text-sm">{detail.value}</span>
                              </div>
                            ))}
                          </div>

                          <Button
                            variant="destructive"
                            className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200/50"
                            onClick={() => leaveEvent(event.title)}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Leave Event
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Events Yet</h3>
                <p className="text-slate-600">Start exploring and join events that interest you!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* Enhanced Edit Profile Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-slate-200">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-emerald-600" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-6 pt-4">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">Profile Image</Label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={preview || user?.ProfileImage || "/placeholder.svg?height=150&width=150"}
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center ring-3 ring-white">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Input
                      name="ProfileImage"
                      type="file"
                      onChange={handleChange}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">Upload a new profile picture</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Bio</Label>
                  <Input
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Location</Label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Your location..."
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Birthdate</Label>
                <Input
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/50"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard
