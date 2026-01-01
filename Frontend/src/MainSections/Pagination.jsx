import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

function Paginationme() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(15); 
  const [totalPages, setTotalPages] = useState(10); 

 
  const {
    data: responseData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['books', currentPage, limit],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:8000/scrap/pagination/${currentPage}/${limit}`,{withCredentials: true}
      );
      return response.data;
    },
    keepPreviousData: true,
    refetchInterval:false,
  });
  const books = responseData?.data?.books || [];

  useEffect(() => {
    if (responseData?.data?.totalPages) {
      setTotalPages(responseData.data.totalPages);
    }
  }, [responseData]);

  return (
    <div className="container mx-auto p-4 mt-10">
      {isError && <div className="text-red-500">Error: {error.message}</div>}
      <div className="flex flex-col gap-4">
        <div className="grid md:grid-cols-3 grid-cols-2 gap-3">
          {isLoading
            ? 
              [...Array(15)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-4 p-4 border border-gray-300 rounded-lg animate-pulse"
                >
                  <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            : // Display books when loaded
              books.map((book) => (
                <div
                  key={book._id}
                  className="flex flex-row gap-4 p-4 border border-gray-300 rounded-lg"
                >
                  <img
                    src={book.Img}
                    alt={book.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Title: {book.title}</h2>
                    <p className="text-sm text-gray-500">Rating: {book.rating}</p>
                    <p className="text-sm text-gray-500">Price: {book.price}</p>
                    <h1>CreatedAt: {book.createdAt}</h1>
                  </div>
                </div>
              ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;

            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }

            if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
              return (
                <span key={pageNumber} className="px-2">
                  ...
                </span>
              );
            }

            return null;
          })}

          <button
            className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Paginationme;
