import React from 'react'
import ProductCard from './TrialCard'

function Trial() {
    const productsData = [
  {
    title: "Explore the Mountains",
    subtitle: "Adventure Awaits",
    description:
      "Discover breathtaking mountain trails and scenic views. Perfect for hiking enthusiasts and nature lovers.",
    badgeText: "New",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "City Lights at Night",
    subtitle: "Urban Exploration",
    description: "Experience the vibrant nightlife and stunning cityscapes. Great for photographers and night owls.",
    badgeText: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Serene Beaches",
    subtitle: "Relax & Unwind",
    description: "Find peace by the ocean with soft sands and gentle waves. Ideal for a calming getaway.",
    badgeText: "Trending",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Forest Trails",
    subtitle: "Reconnect with Nature",
    description: "Explore lush green forests and peaceful paths. Perfect for hiking and wildlife spotting.",
    badgeText: "Featured",
    imageUrl: "https://images.unsplash.com/photo-1445820133835-4b9eae87a3aa?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Desert Safari",
    subtitle: "Thrill Seeker's Dream",
    description: "Experience the excitement of desert dunes and starry nights. A must-try adventure.",
    badgeText: "Exclusive",
    imageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
  },
]

  return (
   <>
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-textPrimary mb-2 text-center">Discover Amazing Destinations</h1>
        <p className="text-textSecondary text-center mb-12 text-lg">
          Explore breathtaking locations and create unforgettable memories
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsData.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      </div>
    </div>
   </>
  )
}

export default Trial