import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

function MakeQr() {
  const generateqr = async () => {
    const res = await axios.get('http://localhost:8000/participate/qr', {
      withCredentials: true,
    });
    return res.data.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['generateqr'],
    queryFn: generateqr,
    staleTime: 60 * 60 * 1000, // fixed staleTime to ms
  });

  if (isLoading) {
    return (
      <section className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 p-4 rounded-xl shadow-md h-[250px] flex flex-col items-center justify-center"
          >
            <div className="w-32 h-32 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 w-40 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
          </div>
        ))}
      </section>
    );
  }

  if (isError) {
    return <h1 className="text-red-500 ml-10 mt-10">Error fetching QR codes</h1>;
  }

  return (
    <section className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {data.qrResults.map((item, index) => (
        <div
          key={item.email + index}
          className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center justify-center hover:scale-[1.02] transition"
        >
          <img src={item.data} alt="QR Code" className="w-32 h-32 mb-3" />
          <div className="text-center">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default MakeQr;
