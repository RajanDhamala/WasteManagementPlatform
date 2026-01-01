import { useState } from "react"
import { X, Upload, Trash2, ArrowLeft, ArrowRight, Loader2, FileText, MapPin, Users, Camera, Check } from "lucide-react"
import axios from "axios"
import LocationPicker from "./LocationPicker"
import userStore from "@/ZustandStore/UserStore"

const CreateEvent = ({ isOpen, onClose, onSuccess }) => {

const setAlert = userStore((state) => state.setAlert);
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemStatement: "",
    datetime: "",
    location: "",
    requiredVolunteers: "",
  })

  const [coordinates,setCoordinates]=useState(null)

  const [images, setImages] = useState([])
  const [dragActive, setDragActive] = useState(false)

  const steps = [
    { number: 1, title: "What's happening?", fields: ["title", "description", "problemStatement"] },
    { number: 2, title: "When & where?", fields: ["datetime", "location"] },
    { number: 3, title: "Need help?", fields: ["requiredVolunteers"] },
    { number: 4, title: "Show it off", fields: [] },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateStep = (stepNumber) => {
    const step = steps[stepNumber - 1]
    return step.fields.every((field) => {
      if (field === "requiredVolunteers") {
        return formData[field] && Number.parseInt(formData[field]) > 0
      }
      return formData[field] && formData[field].trim() !== ""
    })
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    } else {
      // alert("Hold up! Fill out everything on this step first 😊")
       setAlert({ type: 'error', message: 'Hold up! Fill out everything on this step first' });
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/svg+xml", "image/webp"]
      const maxSize = 10 * 1024 * 1024

      if (!validTypes.includes(file.type)) {
        alert(`Oops! ${file.name} isn't an image we can use. Try JPG, PNG, GIF, SVG, or WEBP`)
        return false
      }

      if (file.size > maxSize) {
        alert(`${file.name} is too chunky! Keep it under 10MB please`)
        return false
      }

      return true
    })

    const remainingSlots = 3 - images.length
    const filesToAdd = validFiles.slice(0, remainingSlots)

    if (validFiles.length > remainingSlots) {
      alert(`Whoa there! You can only add ${remainingSlots} more image${remainingSlots !== 1 ? "s" : ""}`)
    }

    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }))

    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (imageId) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== imageId)
      const removed = prev.find((img) => img.id === imageId)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }

  const handleSubmit = async () => {
    if (images.length === 0) {
          setAlert({type:'success',message:"Don't forget to add some photos! People love seeing"})
      return

    }

    setIsSubmitting(true)

try {
  const submitData = new FormData()
  const datetime = new Date(formData.datetime)
  const date = datetime.toISOString().split("T")[0]             
  const time = datetime.toTimeString().slice(0, 5)             

  submitData.append("title", formData.title)
  submitData.append("description", formData.description)
  submitData.append("problemStatement", formData.problemStatement)
  submitData.append("date", date)                        
  submitData.append("time", time)                        
  submitData.append("location", formData.location)
  submitData.append("coordinates", JSON.stringify(coordinates))
  submitData.append("requiredVolunteers", formData.requiredVolunteers)

  // Append images
  images.forEach((image) => {
    submitData.append("images", image.file)
  })

  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}event/eventform`,
    submitData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  )

  setAlert({type:"success",message:"Sweet! Your event is live"})
  resetForm()
  onClose()
  if (onSuccess) onSuccess(response.data)
} catch (error) {
  console.error("Error creating event:", error)
    setAlert({type:"error",message:"Hmm, something went wrong. Mind trying again?"})
} finally {
  setIsSubmitting(false)
}
  }
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      problemStatement: "",
      datetime: "",
      location: "",
      requiredVolunteers: "",
    })
    setCoordinates(null)
    setImages([])
    setCurrentStep(1)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Create an event</h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Better Stepper with Icons */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              const isUpcoming = currentStep < step.number

              // Choose icon for each step
              let StepIcon
              switch (step.number) {
                case 1:
                  StepIcon = FileText
                  break
                case 2:
                  StepIcon = MapPin
                  break
                case 3:
                  StepIcon = Users
                  break
                case 4:
                  StepIcon = Camera
                  break
                default:
                  StepIcon = FileText
              }

              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isCompleted
                          ? "bg-green-500 text-white shadow-md"
                          : isActive
                            ? "bg-blue-500 text-white shadow-md scale-110"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium transition-colors max-w-[80px] text-center leading-tight ${
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 transition-colors duration-200 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What's your event called?</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Something catchy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tell people what it's about</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="What will people be doing? What should they expect?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What problem are you solving?</label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Why does this event matter?"
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When's it happening?</label>
                <input
                  type="datetime-local"
                  name="datetime"
                  value={formData.datetime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Where should people show up?</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Address, venue name, or 'online'"
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How many volunteers do you need?</label>
                <input
                  type="number"
                  name="requiredVolunteers"
                  value={formData.requiredVolunteers}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Just a rough number"
                />
                <LocationPicker  setLocation={setCoordinates}/>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add some photos ({images.length}/3)
                </label>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  } ${images.length >= 3 ? "opacity-50 pointer-events-none" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-1">
                    Drop your images here, or{" "}
                    <label className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={images.length >= 3}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-400">JPG, PNG, GIF, SVG, WEBP • Max 10MB each</p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-lg hover:bg-white"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>

          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
              >
                Continue
                <ArrowRight size={18} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || images.length === 0}
                className="flex items-center px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create event"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateEvent
