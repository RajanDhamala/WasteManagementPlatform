"use client"

import { useState, useRef, useCallback, memo } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import axios from "axios"
import {
  Upload,
  X,
  ImageIcon,
  Film,
  Clock,
  Check,
  Trash2,
  Plus,
  ArrowLeft,
  ChevronLeft,
  ArrowLeftRight,
} from "lucide-react"

const UPLOAD_TYPES = {
  beforeAfter: { title: "Before & After Photos", icon: ArrowLeftRight, color: "blue" },
  gallery: { title: "Event Gallery", icon: ImageIcon, color: "green" },
  recordings: { title: "Video Recordings", icon: Film, color: "purple" },
}

const ProgressIndicator = memo(({ progress }) => (
  <div className="space-y-3 text-center py-6">
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
    </div>
    <p className="text-sm font-medium text-gray-700">Uploading... {progress}%</p>
    <div className="w-3/4 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
      <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  </div>
))

const ImageUpload = memo(({ label, image, onChange, onRemove, inputRef }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-800">{label}</label>
    <input type="file" ref={inputRef} onChange={onChange} className="hidden" accept="image/*" />
    {image ? (
      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <img src={image.preview} alt={label} className="w-full h-56 object-cover" />
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 bg-red-600 bg-opacity-80 text-white p-2 rounded-full hover:bg-opacity-100 transition-all"
        >
          <X size={18} />
        </button>
      </div>
    ) : (
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 h-56 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
      >
        <Upload size={28} className="text-blue-600 mb-3" />
        <p className="text-sm font-medium text-gray-700">Upload {label}</p>
        <p className="text-xs text-gray-500">JPG, PNG, or WebP</p>
      </div>
    )}
  </div>
))

const MediaPreview = memo(({ media, captionState, onCaptionChange, onRemove, type }) => (
  <div className="space-y-6">
    <h4 className="text-xl font-semibold text-gray-800">
      {media.length} {type === "recordings" ? "Video" : "Image"}{media.length !== 1 ? "s" : ""} Selected
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {media.map((item) => (
        <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all">
          <div className="relative h-56">
            {item.type === "image" ? (
              <img src={item.preview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Film size={48} className="text-white opacity-80" />
              </div>
            )}
            <button
              onClick={() => onRemove(item.id)}
              className="absolute top-3 right-3 bg-red-600 bg-opacity-80 text-white p-2 rounded-full hover:bg-opacity-100 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Add a caption..."
            className="w-full p-3 border-t border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            value={captionState[item.id] || ""}
            onChange={(e) => onCaptionChange(item.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  </div>
))

const BeforeAfterPreview = memo(({ beforeImage, afterImage, caption }) => (
  <div className="space-y-6">
    <h4 className="text-xl font-semibold text-gray-800 flex items-center">
      <Check size={20} className="mr-2 text-green-500" /> Comparison Ready
    </h4>
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md">
      <div className="grid grid-cols-2">
        <div className="relative">
          <img src={beforeImage.preview} className="w-full h-72 object-cover" alt="Before" />
          <span className="absolute top-3 left-3 bg-gray-900 bg-opacity-80 text-white text-xs font-medium px-2 py-1 rounded">BEFORE</span>
        </div>
        <div className="relative">
          <img src={afterImage.preview} className="w-full h-72 object-cover" alt="After" />
          <span className="absolute top-3 left-3 bg-gray-900 bg-opacity-80 text-white text-xs font-medium px-2 py-1 rounded">AFTER</span>
        </div>
      </div>
      <p className="p-4 text-sm text-gray-700 font-medium">{caption || "No caption provided"}</p>
    </div>
  </div>
))

const CreateReport = ({ eventId, onUploadComplete }) => {
  const [eventState, setEventState] = useState({ selectedEvent: null, uploadType: "" })
  const [mediaState, setMediaState] = useState({
    uploadedMedia: { gallery: [], recordings: [] },
    beforeImage: null,
    afterImage: null,
    hasComparisonUploaded: false,
  })
  const [captionState, setCaptionState] = useState({ pairCaption: "", mediaCaptions: {} })
  const [uploadState, setUploadState] = useState({ isUploading: false, progress: 0 })

  const fileRefs = {
    fileInput: useRef(null),
    videoInput: useRef(null),
    beforeImage: useRef(null),
    afterImage: useRef(null),
  }

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["GetAllEvents"],
    queryFn: async () =>
      (await axios.get("http://localhost:8000/community/GetAllEvents", { withCredentials: true })).data.data.events,
  })

  const mutation = useMutation({
    mutationFn: (formData) =>
      axios.post(
        `http://localhost:8000/report/${
          eventState.uploadType === "beforeAfter" ? "Before_After" : eventState.uploadType === "gallery" ? "Image_Gallary" : "Video_Gallary"
        }`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      ),
    onSuccess: () => {
      onUploadComplete?.({ eventId: eventState.selectedEvent._id, media: prepareMedia() })
      resetState()
    },
    onError: () => setUploadState({ isUploading: false, progress: 0 }),
  })

  const prepareMedia = useCallback(() => ({
    gallery: mediaState.uploadedMedia.gallery.map((item) => ({ ...item, caption: captionState.mediaCaptions[item.id] || "" })),
    recordings: mediaState.uploadedMedia.recordings.map((item) => ({ ...item, caption: captionState.mediaCaptions[item.id] || "" })),
    beforeAfter: mediaState.hasComparisonUploaded
      ? [
          { ...mediaState.beforeImage, caption: captionState.pairCaption, isBefore: true },
          { ...mediaState.afterImage, caption: captionState.pairCaption, isBefore: false },
        ]
      : [],
  }), [mediaState, captionState])

  const resetState = useCallback(() => {
    setEventState({ selectedEvent: null, uploadType: "" })
    setMediaState({ uploadedMedia: { gallery: [], recordings: [] }, beforeImage: null, afterImage: null, hasComparisonUploaded: false })
    setCaptionState({ pairCaption: "", mediaCaptions: {} })
    setUploadState({ isUploading: false, progress: 0 })
  }, [])

  const handleFiles = useCallback((files, type) => {
    const mediaFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      type: file.type.startsWith("image/") ? "image" : "video",
    }))
    setMediaState((prev) => ({
      ...prev,
      uploadedMedia: { ...prev.uploadedMedia, [type]: [...prev.uploadedMedia[type], ...mediaFiles] },
    }))
  }, [])

  const handleBeforeAfter = useCallback((file, isBefore) => {
    const media = { id: Math.random().toString(36).substring(2), file, preview: URL.createObjectURL(file), type: "image" }
    setMediaState((prev) => ({ ...prev, [isBefore ? "beforeImage" : "afterImage"]: media }))
  }, [])

  const handleSubmit = useCallback(async () => {
    setUploadState({ isUploading: true, progress: 0 })
    const formData = new FormData()
    formData.append("eventId", eventState.selectedEvent._id)

    const interval = setInterval(() => {
      setUploadState((prev) => ({ ...prev, progress: Math.min(prev.progress + 10, 90) }))
    }, 300)

    try {
      if (eventState.uploadType === "beforeAfter") {
        formData.append("caption", captionState.pairCaption)
        formData.append("BeforeImg", mediaState.beforeImage.file)
        formData.append("AfterImg", mediaState.afterImage.file)
      } else {
        const media = mediaState.uploadedMedia[eventState.uploadType]
        media.forEach((item, i) => {
          formData.append(eventState.uploadType === "gallery" ? "Gallary_img" : "Video_gallary", item.file)
          formData.append(`captions[${i}]`, captionState.mediaCaptions[item.id] || "")
        })
      }
      await mutation.mutateAsync(formData)
      clearInterval(interval)
      setUploadState((prev) => ({ ...prev, progress: 100 }))
    } catch (error) {
      clearInterval(interval)
      throw error
    }
  }, [eventState, mediaState, captionState, mutation])

  const renderContent = () => {
    if (!eventState.selectedEvent) {
      return (
        <div className="space-y-8 animate-fade-in">
          <h3 className="text-3xl font-bold text-gray-900 text-center">Select an Event</h3>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5">
              {events.map((event) => (
                <div
                  key={event._id}
                  onClick={() => setEventState((prev) => ({ ...prev, selectedEvent: event }))}
                  className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all border border-gray-100 hover:border-blue-200"
                >
                  <h4 className="font-semibold text-xl text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Clock size={16} className="text-gray-500" /> {new Date(event.date).toLocaleDateString()} • {event.location}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (!eventState.uploadType) {
      return (
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <button onClick={() => setEventState((prev) => ({ ...prev, selectedEvent: null }))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={28} className="text-gray-700" />
            </button>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">{eventState.selectedEvent.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{new Date(eventState.selectedEvent.date).toLocaleDateString()} • {eventState.selectedEvent.location}</p>
            </div>
          </div>
          <p className="text-center text-gray-700 font-medium">What would you like to share?</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(UPLOAD_TYPES).map(([type, { title, icon: Icon, color }]) => (
              <button
                key={type}
                onClick={() => setEventState((prev) => ({ ...prev, uploadType: type }))}
                className={`p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-${color}-50 transition-all border border-gray-100`}
              >
                <Icon size={36} className={`text-${color}-600 mx-auto mb-4`} />
                <h4 className={`font-semibold text-xl text-${color}-700`}>{title}</h4>
                <p className="text-sm text-gray-600 mt-2">
                  {type === "beforeAfter" ? "Show transformations" : type === "gallery" ? "Capture moments" : "Record highlights"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )
    }

    const isBeforeAfter = eventState.uploadType === "beforeAfter"
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button onClick={() => setEventState((prev) => ({ ...prev, uploadType: "" }))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-gray-700" />
          </button>
          <h3 className="text-3xl font-bold text-gray-900">{UPLOAD_TYPES[eventState.uploadType].title}</h3>
        </div>

        {uploadState.isUploading ? (
          <ProgressIndicator progress={uploadState.progress} />
        ) : isBeforeAfter ? (
          mediaState.hasComparisonUploaded ? (
            <BeforeAfterPreview beforeImage={mediaState.beforeImage} afterImage={mediaState.afterImage} caption={captionState.pairCaption} />
          ) : (
            <div className="space-y-6 p-6 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  label="Before"
                  image={mediaState.beforeImage}
                  onChange={(e) => handleBeforeAfter(e.target.files[0], true)}
                  onRemove={() => setMediaState((prev) => ({ ...prev, beforeImage: null }))}
                  inputRef={fileRefs.beforeImage}
                />
                <ImageUpload
                  label="After"
                  image={mediaState.afterImage}
                  onChange={(e) => handleBeforeAfter(e.target.files[0], false)}
                  onRemove={() => setMediaState((prev) => ({ ...prev, afterImage: null }))}
                  inputRef={fileRefs.afterImage}
                />
              </div>
              <input
                type="text"
                placeholder="Describe the transformation..."
                className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                value={captionState.pairCaption}
                onChange={(e) => setCaptionState((prev) => ({ ...prev, pairCaption: e.target.value }))}
              />
              <button
                onClick={() => setMediaState((prev) => ({ ...prev, hasComparisonUploaded: true }))}
                disabled={!mediaState.beforeImage || !mediaState.afterImage}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
              >
                <Plus size={20} className="mr-2" /> Add Comparison
              </button>
            </div>
          )
        ) : (
          <>
            <div
              onClick={() => fileRefs[eventState.uploadType === "recordings" ? "videoInput" : "fileInput"].current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer bg-white shadow-md hover:bg-${UPLOAD_TYPES[eventState.uploadType].color}-50 transition-all`}
            >
              <input
                type="file"
                ref={fileRefs[eventState.uploadType === "recordings" ? "videoInput" : "fileInput"]}
                onChange={(e) => handleFiles(e.target.files, eventState.uploadType)}
                className="hidden"
                multiple
                accept={eventState.uploadType === "recordings" ? "video/*" : "image/*"}
              />
              <Upload size={36} className={`text-${UPLOAD_TYPES[eventState.uploadType].color}-600 mx-auto mb-4`} />
              <p className="text-xl font-semibold text-gray-900">
                {mediaState.uploadedMedia[eventState.uploadType].length ? "Add More Files" : "Drop Files Here"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {eventState.uploadType === "recordings" ? "MP4, MOV up to 100MB" : "JPG, PNG up to 10MB"}
              </p>
            </div>
            {mediaState.uploadedMedia[eventState.uploadType].length > 0 && (
              <MediaPreview
                media={mediaState.uploadedMedia[eventState.uploadType]}
                captionState={captionState.mediaCaptions}
                onCaptionChange={(id, caption) =>
                  setCaptionState((prev) => ({ ...prev, mediaCaptions: { ...prev.mediaCaptions, [id]: caption } }))
                }
                onRemove={(id) =>
                  setMediaState((prev) => ({
                    ...prev,
                    uploadedMedia: {
                      ...prev.uploadedMedia,
                      [eventState.uploadType]: prev.uploadedMedia[eventState.uploadType].filter((item) => item.id !== id),
                    },
                  }))
                }
                type={eventState.uploadType}
              />
            )}
          </>
        )}

        <div className="flex justify-between pt-8 border-t border-gray-200">
          <button
            onClick={() => setEventState((prev) => ({ ...prev, uploadType: "" }))}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 flex items-center font-medium rounded-lg hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              uploadState.isUploading ||
              (!isBeforeAfter && !mediaState.uploadedMedia[eventState.uploadType].length) ||
              (isBeforeAfter && !mediaState.hasComparisonUploaded)
            }
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center font-medium shadow-md hover:shadow-lg transition-all"
          >
            {uploadState.isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check size={20} className="mr-2" /> Save
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-5xl mx-auto my-10 p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <Upload size={28} className="mr-3 text-blue-600" /> Event Media Upload
        </h2>
        <p className="text-gray-600 text-sm mt-2">Share your event highlights with the community</p>
      </header>
      {renderContent()}
    </div>
  )
}

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`

export default CreateReport