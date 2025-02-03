import { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

const Alert = ({ type = "info", title, message, onClose, autoClose = true, duration = 5000 }) => {
  const alertStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
    update: "bg-indigo-500 text-white",
  }

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <AlertCircle className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
    update: <Info className="w-6 h-6" />,
  }

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const alertContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.5 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.5 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
        className={`fixed z-50 top-4 right-4 w-full max-w-sm overflow-hidden rounded-md shadow-lg ${alertStyles[type]}`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium truncate">{title}</p>
              <p className="mt-1 text-sm opacity-90 line-clamp-2">{message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                className="inline-flex rounded-md bg-transparent text-white hover:text-gray-200 focus:outline-none focus:scale-110  focus:ring-offset-2 "
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(alertContent, document.body)
}

export default Alert

