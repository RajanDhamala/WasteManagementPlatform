import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Paginationme() {
  const [books, setbooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10); // This will be dynamic later
  const [limit, setLimit] = useState(15); // Number of books per page

  // ...existing code...



  useEffect(()=>{

    const fetchdata=async()=>{
        try{
            const repsonse=await axios.get(`http://localhost:8000/scrap/pagination/${currentPage}/${limit}`);
            console.log(repsonse.data)
            if(repsonse.data.data){
                setbooks(repsonse.data.data.books);
                
            }
        }catch(err){
            console.error("Failed to load books",err);
        }
    }
    fetchdata();

  },[currentPage,limit])

  return (
    <div className="container mx-auto p-4">
      
      <div className="flex flex-col gap-4">
      <div className='grid md:grid-cols-3 grid-cols-2 gap-3 '>
            {
                books.map((book)=>{
                    return(
                        <div key={book._id} className="flex flex-row gap-4 p-4 border border-gray-300 rounded-lg">
                            <img src={book.Img} alt={book.title} className="w-24 h-24 object-cover rounded-lg"/>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-lg font-semibold">Title:{book.title}</h2>
                                <p className="text-sm text-gray-500">Rating:{book.rating}</p>
                                <p className="text-sm text-gray-500">Price:{book.price}</p>
                                <h1>createdAt:{book.createdAt}</h1>
                            </div>
                        </div>
                    )
                })
            }
        </div>
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={(e)=>setCurrentPage(currentPage-1)}
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
                onClick={(e)=>setCurrentPage(pageNumber)}
                  key={pageNumber}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  {pageNumber}
                </button>
              );
            }

            // Show ellipsis
            if (
              pageNumber === currentPage - 2 ||
              pageNumber === currentPage + 2
            ) {
              return (
                <span key={pageNumber} className="px-2">
                  ...
                </span>
              );
            }

            return null;
          })}

          <button
            className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={(e)=>setCurrentPage(currentPage+1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Paginationme;