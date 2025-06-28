import { Eye, Compass, Star, MapPin } from "lucide-react"

export default function ProductCard({ product }) {
  const { title, subtitle, description, badgeText, imageUrl } = product

  return (
    <div className="bg-surface rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-accent text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star className="w-3 h-3" />
            {badgeText}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-textSecondary" />
          <span className="text-textSecondary text-sm font-medium uppercase tracking-wide">{subtitle}</span>
        </div>

        <h3 className="text-textPrimary text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>

        <p className="text-textSecondary text-sm leading-relaxed mb-6">{description}</p>

        <div className="flex gap-3">
          <button className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
            <Compass className="w-4 h-4" />
            Explore
          </button>

          <button className="bg-secondary hover:bg-secondary/90 text-black px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            See More
          </button>
        </div>
      </div>
    </div>
  )
}