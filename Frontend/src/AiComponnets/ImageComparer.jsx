import { useState, useRef } from "react"


const ImageComparer = ({
  beforeImage = "https://res.cloudinary.com/dy78jnaye/image/upload/f_auto,q_auto/v1/event_images/1739928266678?_a=BAMCkGWM0",
  afterImage = "https://res.cloudinary.com/dy78jnaye/image/upload/f_auto,q_auto/v1/event_images/1739253682201?_a=BAMCkGWM0",
  className = "",
}) => {
  const [position, setPosition] = useState(50)
  const containerRef = useRef(null)

  const updatePosition = (clientX) => {
    if (!containerRef.current) return
    
    const { left, width } = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(width, clientX - left))
    const newPosition = (x / width) * 100
    
    setPosition(newPosition)
  }

  const handleMouseDown = (e) => {
    updatePosition(e.clientX)
    
    const handleMouseMove = (e) => updatePosition(e.clientX)
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleTouchStart = (e) => {
    e.preventDefault() 
    updatePosition(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    updatePosition(e.touches[0].clientX)
  }

  return (
    <div className="p-4 border rounded-3xl bg-neutral-100 border-neutral-200 px-4">
      <h2 className="text-2xl font-bold text-center mb-4">Waste Management Cleanup Results</h2>
      <div
        ref={containerRef}
        className={`relative h-[250px] md:h-[500px] rounded-xl overflow-hidden ${className}`}
      >
        {/* After image - shown as background */}
        <img
          src={afterImage || "/placeholder.svg"}
          alt="After cleanup"
          className="absolute top-0 left-0 w-full h-full object-cover object-center"
        />
        
        {/* Before image - shown with clip */}
        <div 
          className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeImage || "/placeholder.svg"}
            alt="Before cleanup"
            className="absolute top-0 left-0 w-full h-full object-cover object-center brightness-75 saturate-50"
            style={{ 
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              maxWidth: '9999px' // Ensure image can be as wide as needed
            }}
          />
        </div>
        
        {/* Divider line and drag handle */}
        <div 
          className="absolute top-0 h-full select-none touch-none"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize">
            {/* Handle circle */}
            <div className="absolute top-1/2 left-0 w-8 h-8 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                <path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-green-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
          After
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium bg-black/50 mx-auto w-fit px-3 py-1 rounded-full">
          Drag to compare
        </div>
      </div>
      <p className="text-center mt-4 text-sm text-gray-600">
        See the dramatic transformation of our waste management cleanup project. Slide to compare before and after
        results.
      </p>
    </div>
  )
}

export default ImageComparer