import React, { useEffect, useState } from 'react';

const StreamsData = () => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        const response = await fetch('http://localhost:8000/stream/chunks', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();

        const streamChunksToImage = async () => {
          const { done, value } = await reader.read();
          if (done) {
            console.log('Finished streaming.');
            return;
          }

          // For binary data (image/video), append the chunk to a Blob
          const blob = new Blob([value], { type: 'image/webp' }); // Adjust MIME type as per your media type
          const url = URL.createObjectURL(blob);

          // Set the image URL to display it
          setImageUrl(url);

          console.log('Received chunk:', value);
          
          await streamChunksToImage(); // Continue streaming
        };

        // Start the streaming
        streamChunksToImage();

      } catch (err) {
        console.error('Error fetching the stream:', err);
      }
    };

    fetchStreamData();
  }, []);

  return (
    <div>
      {imageUrl ? (
        <img src={imageUrl} alt="Streamed Content" className='h-screen w-screen object-cover p-20 rounded-md' />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default StreamsData;
