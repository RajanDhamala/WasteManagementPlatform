import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, MapPin, Calendar, Settings, Camera, 
  Mail, Activity, ChevronRight, LogOut, Coffee
} from "lucide-react";
import { useAlert } from "@/UserContext/AlertContext";


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    birthdate: "",
    ProfileImage: null,
  });
  const [preview, setPreview] = useState(null);

  const {setAlert}=useAlert();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user/profile", { withCredentials: true });
      setUser(res.data.data);
      setFormData({
        bio: res.data.data.bio || "",
        location: res.data.data.location || "",
        birthdate: res.data.data.birthdate ? moment(res.data.data.birthdate).format("YYYY-MM-DD") : "",
        ProfileImage: res.data.data.ProfileImage || null,
      });

      if(res.data.statusCode===200){
        console.log(res.data.data);
      }else{
        setAlert({type:"error",message:res.data.message,title:'Update' } );
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      setAlert({type:"error",message:error,title:'Update' } );
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  async function  handelLogout(e){
    const response=await axios.get("http://localhost:8000/user/logout",{withCredentials:true});
    console.log(response.data.data);
    setAlert({type:"success",message:response.data.message,title:'Logout' } );
    setTimeout(()=>{
      window.location.href="/login";
    },1500)
}

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'ProfileImage' && formData[key] instanceof File) {
        updatedData.append(key, formData[key]);
      } else if (key !== 'ProfileImage') {
        updatedData.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.post("http://localhost:8000/user/UpdateProfile", updatedData, {
        withCredentials: true,
      });

      if(res.data.statusCode===200){
        setUser(res.data.data);
        setOpen(false);
        setAlert({type:"success",message:res.data.message,title:'Update' } );
      }else{
        setAlert({type:"error",message:res.data.message,title:'Update' } );
      }

    } catch (error) {
      console.error("Error updating profile:", error);
      setAlert({type:"error",message:error,title:'Update' } );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Activity size={40} className="text-blue-600" />
          </motion.div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:mt-14 mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <img
                        src={preview || user?.ProfileImage || "/api/placeholder/150/150"}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <Camera className="text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
                      </div>
                    </motion.div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{user?.name}</h2>
                  <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                  <div className="w-full space-y-2">
                    <Button 
                      onClick={() => setOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    <User size={18} />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    <Coffee size={18} />
                    <span>Activity</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200" onClick={(e)=>handelLogout(e)}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="lg:col-span-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl text-gray-900">Profile Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
                    >
                      <div className="flex items-center space-x-3 text-blue-600 mb-4">
                        <User size={24} />
                        <h3 className="text-lg font-semibold">Bio</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {user?.bio || "Tell us about yourself..."}
                      </p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
                    >
                      <div className="flex items-center space-x-3 text-purple-600 mb-4">
                        <MapPin size={24} />
                        <h3 className="text-lg font-semibold">Location</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {user?.location || "Add your location..."}
                      </p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 md:col-span-2"
                    >
                      <div className="flex items-center space-x-3 text-green-600 mb-4">
                        <Calendar size={24} />
                        <h3 className="text-lg font-semibold">Member Since</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {user?.birthdate ? moment(user.birthdate).format("MMMM DD, YYYY") : "Add your birthdate..."}
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl text-gray-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Activity size={20} />
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">Profile updated</p>
                            <p className="text-gray-500 text-sm">{moment().subtract(i + 1, 'days').format('MMMM D, YYYY')}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Profile Image</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <img
                    src={preview || user?.ProfileImage || "/api/placeholder/150/150"}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <Input
                    name="ProfileImage"
                    type="file"
                    onChange={handleChange}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Input
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Birthdate</Label>
                <Input
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;