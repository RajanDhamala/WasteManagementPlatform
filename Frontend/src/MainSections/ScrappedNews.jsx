import React, { useState, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, index) => (
        <Card key={index} className="shadow-sm">
          <Skeleton className="w-full h-48" />
          <CardContent className="mt-2">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ScrappedNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [scrap, setScrap] = useState(false)

  const fetchNews = async () => {
    try {
      const isInitialLoad = !scrap
      isInitialLoad ? setLoading(true) : setRefreshing(true)

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}scrap/scrapnews`, {
        params: { scrap: scrap ? true : false }
      })

      if (response.data.data.news) {
        setNews(response.data.data.news)
      } else {
        setNews([])
      }
      setError(null)
    } catch (err) {
      setError('Failed to load news')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  if (loading) return (
    <div className="container mx-auto p-4">
      <Skeleton className="h-8 w-48 mx-auto mb-6" />
      <LoadingSkeleton />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  )

  if (news.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <p className="text-lg text-gray-500">No news available.</p>
    </div>
  )

  return (
    <div className="container mx-auto p-4 mt-14">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Latest News</h1>

        <Button
          onClick={() => {
            setScrap(true)
            fetchNews()
          }}
          disabled={refreshing}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white 
                     transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Refresh News'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <Card
            key={index}
            className="group bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            style={{
              animation: `fadeIn 0.5s ease-out ${index * 0.1}s`,
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            <div className="relative h-48 overflow-hidden bg-gray-50">
              <img
                draggable="false"
                src={item.Img.replace(/w_175/, 'w_400').replace(/h_98/, 'h_225')}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.02]"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x225"
                  e.target.alt = "News image not available"
                }}
              />
              <span className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 group-hover:bg-blue-700">
                {item.field}
              </span>
            </div>
            <CardContent className="p-4">
              <a
                draggable="false"
                href={item.titleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h2 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer hover:underline">
                  {item.title}
                </h2>
              </a>
              <p className="text-gray-500 text-sm">
                {moment.unix(item.time).fromNow()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ScrappedNews
