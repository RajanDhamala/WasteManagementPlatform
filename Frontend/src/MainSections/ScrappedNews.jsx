import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";


const fetchNews = async (scrap) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}scrap/scrapnews`, {
    params: { scrap },
  });
  return response.data.data.news || [];
};

function ScrappedNews() {
  const queryClient = useQueryClient();
  const [scrap, setScrap] = useState(false);
  
  const { data: news = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['news', scrap],
    queryFn: () => fetchNews(scrap),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, 
  });


  const handleRefresh = () => {
    setScrap(true);
    setTimeout(() => {
      refetch();
    }, 4000);
  };

  const handlePageReload = () => {
    setTimeout(() => {
      window.location.reload();
    }, 5000); 
  };

  return (
    <div className="container mx-auto p-4 mt-14">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Latest News</h1>
        <Button
          onClick={() => {
            handleRefresh();
            handlePageReload(); // Call to reload the page after refresh
          }}
          disabled={isFetching}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Updating...' : 'Refresh News'}
        </Button>
      </div>

      {isLoading && <LoadingSkeleton />}
      {isError && <p className="text-red-500 text-lg text-center">Failed to load news</p>}
      {news.length === 0 && !isLoading && !isError && (
        <p className="text-lg text-gray-500 text-center">No news available.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <Card
            key={index}
            className="group bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="relative h-48 overflow-hidden bg-gray-50">
              <ImageWithSkeleton src={item.Img.replace(/w_175/, 'w_400').replace(/h_98/, 'h_225')} alt={item.title} />
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
              <p className="text-gray-500 text-sm">{moment.unix(item.time).fromNow()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

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
  );
}

function ImageWithSkeleton({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && !error && <Skeleton className="absolute inset-0 w-full h-full" />}
      <img
        src={error ? "https://via.placeholder.com/400x225" : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

export default ScrappedNews;
