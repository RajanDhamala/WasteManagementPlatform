import { useState, useRef, useCallback, memo } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import axios from "axios"
import {Upload,X,ImageIcon,Film,Clock,Check,Trash2,Plus,ArrowLeft,ChevronLeft,ArrowLeftRight,MapPin,Calendar,Camera,AlertCircle,} from "lucide-react"

const UPLOAD_TYPES = {
  beforeAfter: { 
    title: "Before & After Photos", 
    description: "Show transformations with side-by-side comparisons",
    icon: ArrowLeftRight, 
    color: "blue" 
  },
  gallery: { 
    title: "Event Gallery", 
    description: "Share memorable moments with the community",
    icon: ImageIcon, 
    color: "emerald" 
  },
  recordings: { 
    title: "Video Recordings", 
    description: "Capture dynamic highlights from the event",
    icon: Film, 
    color: "purple" 
  },
}

const ProgressIndicator = memo(({ progress }) => (
  <div className="space-y-4 text-center py-8 max-w-md mx-auto">
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
    </div>
    <p className="text-sm font-medium text-gray-700">Uploading your media...</p>
    <div className="relative pt-4">
      <div className="text-xs text-blue-600 font-semibold mb-1">{progress}% Complete</div>
      <div className="w-full mx-auto bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  </div>
))

const ImageUpload = memo(({ label, image, onChange, onRemove, inputRef }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-800">{label}</label>
    <input type="file" ref={inputRef} onChange={onChange} className="hidden" accept="image/*" />
    {image ? (
      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow group">
        <img src={image.preview} alt={label} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={onRemove}
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all transform scale-90 hover:scale-100"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white text-sm font-medium">{image.file.name}</p>
        </div>
      </div>
    ) : (
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 h-64 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all hover:border-blue-300"
      >
        <Camera size={36} className="text-blue-500 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Upload {label}</p>
        <p className="text-xs text-gray-500 mt-1">Click or drag & drop image here</p>
        <p className="text-xs text-gray-400 mt-3">JPG, PNG, or WebP</p>
      </div>
    )}
  </div>
))

const MediaPreview = memo(({ media, captionState, onCaptionChange, onRemove, type }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h4 className="text-xl font-semibold text-gray-800 flex items-center">
        <div className="mr-3 p-1.5 rounded-full bg-blue-100 text-blue-600">
          {type === "recordings" ? <Film size={20} /> : <ImageIcon size={20} />}
        </div>
        {media.length} {type === "recordings" ? "Video" : "Image"}{media.length !== 1 ? "s" : ""} Selected
      </h4>
      <p className="text-sm text-gray-500">Drag to reorder</p>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {media.map((item) => (
        <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all group">
          <div className="relative h-56">
            {item.type === "image" ? (
              <img src={item.preview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Film size={48} className="text-white opacity-80" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => onRemove(item.id)}
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all transform scale-90 hover:scale-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium truncate">{item.file.name}</p>
            </div>
          </div>
          <div className="p-1 border-t border-gray-200 bg-white">
            <input
              type="text"
              placeholder="Add a caption..."
              className="w-full p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white rounded"
              value={captionState[item.id] || ""}
              onChange={(e) => onCaptionChange(item.id, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
))

const BeforeAfterPreview = memo(({ beforeImage, afterImage, caption, onEdit }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h4 className="text-xl font-semibold text-gray-800 flex items-center">
        <div className="mr-3 p-1.5 rounded-full bg-green-100 text-green-600">
          <Check size={20} />
        </div>
        Comparison Ready
      </h4>
      <button 
        onClick={onEdit} 
        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
      >
        <ArrowLeft size={16} className="mr-1" /> Edit Comparison
      </button>
    </div>
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
      <div className="grid grid-cols-2 gap-1">
        <div className="relative">
          <img src={beforeImage.preview} className="w-full h-80 object-cover" alt="Before" />
          <span className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 text-white text-xs font-medium px-3 py-1.5 rounded-md">BEFORE</span>
        </div>
        <div className="relative">
          <img src={afterImage.preview} className="w-full h-80 object-cover" alt="After" />
          <span className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 text-white text-xs font-medium px-3 py-1.5 rounded-md">AFTER</span>
        </div>
      </div>
      <div className="p-5">
        <h5 className="text-xs uppercase text-gray-500 font-semibold mb-1">Caption</h5>
        <p className="text-sm text-gray-700">{caption || "No caption provided"}</p>
      </div>
    </div>
  </div>
))

const EmptyState = memo(({ type, onClick }) => {
  const typeInfo = UPLOAD_TYPES[type];
  
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer bg-gray-50 hover:bg-${typeInfo.color}-50 hover:border-${typeInfo.color}-300 transition-all text-center`}
    >
      <div className={`p-4 rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-600 mb-4`}>
        {type === "beforeAfter" ? <ArrowLeftRight size={32} /> : 
         type === "gallery" ? <ImageIcon size={32} /> :
         <Film size={32} />}
      </div>
      <h4 className="text-lg font-semibold text-gray-800 mb-2">No {typeInfo.title} Yet</h4>
      <p className="text-sm text-gray-600">Click here to upload {type === "recordings" ? "videos" : "images"}</p>
    </div>
  );
});

const EventCard = memo(({ event, onClick, isSelected }) => (
  <div
    onClick={() => onClick(event)}
    className={`p-6 bg-white rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all border ${
      isSelected ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-100 hover:border-blue-200"
    }`}
  >
    <div className="flex justify-between">
      <h4 className="font-semibold text-xl text-gray-900">{event.title}</h4>
      {isSelected && (
        <div className="p-1 rounded-full bg-blue-100">
          <Check size={18} className="text-blue-600" />
        </div>
      )}
    </div>
    
    <div className="flex items-center gap-4 mt-3">
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <Calendar size={16} className="text-gray-500" /> 
        {new Date(event.date).toLocaleDateString()}
      </div>
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <MapPin size={16} className="text-gray-500" /> 
        {event.location}
      </div>
    </div>
  </div>
));

const UploadTypeCard = memo(({ type, info, onClick }) => (
  <button
    onClick={() => onClick(type)}
    className={`p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-${info.color}-200 hover:bg-${info.color}-50 text-left`}
  >
    <div className={`p-3 rounded-full bg-${info.color}-100 inline-block mb-4`}>
      <info.icon size={28} className={`text-${info.color}-600`} />
    </div>
    <h4 className={`font-semibold text-xl text-gray-800 mb-2`}>{info.title}</h4>
    <p className="text-sm text-gray-600">{info.description}</p>
  </button>
));

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

  const renderEventSelection = () => (
    <div className="space-y-8 animate-fade-in">
      <h3 className="text-3xl font-bold text-gray-900">Select an Event</h3>
      <p className="text-gray-600">Choose an event to upload media for</p>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className=" u -28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-medium text-gray-700">No Events Found</h4>
          <p className="text-gray-500 mt-2">There are no events available to upload media for.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {events.map((event) => (
            <EventCard 
              key={event._id}
              event={event}
              onClick={(event) => setEventState((prev) => ({ ...prev, selectedEvent: event }))}
              isSelected={eventState.selectedEvent?._id === event._id}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderUploadTypeSelection = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setEventState((prev) => ({ ...prev, selectedEvent: null }))} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={28} className="text-gray-700" />
        </button>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{eventState.selectedEvent.title}</h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar size={16} className="text-gray-500" /> 
              {new Date(eventState.selectedEvent.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin size={16} className="text-gray-500" /> 
              {eventState.selectedEvent.location}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
        What type of media would you like to share for this event?
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(UPLOAD_TYPES).map(([type, info]) => (
          <UploadTypeCard 
            key={type}
            type={type}
            info={info}
            onClick={(type) => setEventState((prev) => ({ ...prev, uploadType: type }))}
          />
        ))}
      </div>
    </div>
  );

  const renderBeforeAfterUpload = () => (
    mediaState.hasComparisonUploaded ? (
      <BeforeAfterPreview 
        beforeImage={mediaState.beforeImage} 
        afterImage={mediaState.afterImage} 
        caption={captionState.pairCaption}
        onEdit={() => setMediaState(prev => ({ ...prev, hasComparisonUploaded: false }))}
      />
    ) : (
      <div className="space-y-6 p-8 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-xl font-semibold text-gray-800">Create Before & After Comparison</h4>
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
        <div className="pt-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Caption</label>
          <textarea
            placeholder="Describe the transformation..."
            className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm min-h-24"
            value={captionState.pairCaption}
            onChange={(e) => setCaptionState((prev) => ({ ...prev, pairCaption: e.target.value }))}
          />
        </div>
        <button
          onClick={() => setMediaState((prev) => ({ ...prev, hasComparisonUploaded: true }))}
          disabled={!mediaState.beforeImage || !mediaState.afterImage}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
        >
          <Check size={20} className="mr-2" /> Create Comparison
        </button>
      </div>
    )
  );

  const renderMediaUpload = () => (
    <>
      <div
        onClick={() => fileRefs[eventState.uploadType === "recordings" ? "videoInput" : "fileInput"].current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer bg-white shadow-sm hover:bg-${UPLOAD_TYPES[eventState.uploadType].color}-50 hover:border-${UPLOAD_TYPES[eventState.uploadType].color}-300 transition-all`}
      >
        <input
          type="file"
          ref={fileRefs[eventState.uploadType === "recordings" ? "videoInput" : "fileInput"]}
          onChange={(e) => handleFiles(e.target.files, eventState.uploadType)}
          className="hidden"
          multiple
          accept={eventState.uploadType === "recordings" ? "video/*" : "image/*"}
        />
        <div className={`p-3 rounded-full bg-${UPLOAD_TYPES[eventState.uploadType].color}-100 inline-block mb-4`}>
          <Upload size={28} className={`text-${UPLOAD_TYPES[eventState.uploadType].color}-600`} />
        </div>
        <p className="text-xl font-semibold text-gray-900">
          {mediaState.uploadedMedia[eventState.uploadType].length ? "Add More Files" : "Drop Files Here"}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {eventState.uploadType === "recordings" ? "MP4, MOV up to 100MB" : "JPG, PNG up to 10MB"}
        </p>
        <button className={`mt-4 px-5 py-2 bg-${UPLOAD_TYPES[eventState.uploadType].color}-600 text-white rounded-lg text-sm inline-flex items-center`}>
          <Plus size={16} className="mr-1.5" /> Browse Files
        </button>
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
  );

  const renderContent = () => {
    if (uploadState.isUploading) {
      return <ProgressIndicator progress={uploadState.progress} />;
    }
    
    if (!eventState.selectedEvent) {
      return renderEventSelection();
    }
    
    if (!eventState.uploadType) {
      return renderUploadTypeSelection();
    }
    
    const isBeforeAfter = eventState.uploadType === "beforeAfter";
    
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setEventState((prev) => ({ ...prev, uploadType: "" }))} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={28} className="text-gray-700" />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{UPLOAD_TYPES[eventState.uploadType].title}</h3>
            <p className="text-sm text-gray-600 mt-1">{UPLOAD_TYPES[eventState.uploadType].description}</p>
          </div>
        </div>

        {isBeforeAfter ? renderBeforeAfterUpload() : renderMediaUpload()}

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
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-5xl mx-auto my-10 p-8 md:p-10">
      <header className="mb-10 border-b border-gray-100 pb-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <Upload size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Event Media Upload</h2>
            <p className="text-gray-600 mt-1">Share your event highlights with the community</p>
          </div>
        </div>
      </header>
      {renderContent()}
    </div>
  )
}

export default CreateReport