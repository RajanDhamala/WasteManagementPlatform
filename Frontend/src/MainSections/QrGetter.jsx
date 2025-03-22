import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import React from "react";

function QrGetter() {
  // Fetch QR code
  const fetchQr = async () => {
    const response = await axios.get("http://localhost:8000/report/qr", {
      withCredentials: true,
    });
    return response.data.data; 
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["qrCode"],
    queryFn: fetchQr,
  });


  const verifyQr = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("QR code not available");
      const response = await axios.post(
        "http://localhost:8000/report/verify",
        { hashedQR: data },
        { withCredentials: true } 
      );
      return response.data;
    },
    onSuccess: (result) => {
      console.log("Verification Successful:", result);
      alert("QR Code Verified Successfully!");
    },
    onError: (err) => {
      console.error("Verification Failed:", err);
      alert("QR Code Verification Failed!");
    },
  });

  if (isLoading) return <p>Loading QR Code...</p>;
  if (error) return <p>Error fetching QR Code: {error.message}</p>;

  return (
    <div className="flex justify-center items-center flex-col mt-5">
      <h2 className="text-3xl">Your QR Code</h2>
      {data ? <img src={data} alt="QR Code" /> : <p>No QR code available</p>}
      <button
        className="bg-blue-400 hover:bg-blue-600 rounded-md text-white px-2 py-0.5 mt-2"
        onClick={() => verifyQr.mutate()} 
      >
        Verify Qr
      </button>
    </div>
  );
}

export default QrGetter;
