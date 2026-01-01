import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchQrData = async (eventId) => {
  const response = await axios.get(`http://localhost:8000/participate/get-qr/${eventId}`, {
    withCredentials: true,
  });
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch QR data');
  }
  return response.data.data;
};

function GetQrEvent({ eventId, Dates,Times }) {
  console.log("eventId:",eventId)
  const [drawerOpen, setDrawerOpen] = useState(false);

  // React Query setup
  const {
    data: qrData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['qrData', eventId],
    queryFn: () => fetchQrData(eventId),
    enabled: false,
  });

  const isWithin24Hours = (() => {
  const datePart = Dates.split('T')[0]; 
  
  const fullDateTimeString = `${datePart}T${Times}:00`; 
  
  const eventTime = new Date(fullDateTimeString);
  const now = new Date();
  const timeDiff = eventTime - now; 

  const twentyFourHours = 24 * 60 * 60 * 1000;
  const sixHours = 6 * 60 * 60 * 1000;

  return (timeDiff > 0 && timeDiff <= twentyFourHours) || (timeDiff < 0 && Math.abs(timeDiff) <= sixHours);
  })();

  const handleClick = async () => {
    try {
      const result = await refetch();
      if (result.data) {
        setDrawerOpen(true);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  return (
    <div>
      {!isWithin24Hours ? (
        <Button onClick={handleClick}>View QR Code</Button>
      ) : (
        <Button disabled>Available soon</Button>
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Event QR Code</DrawerTitle>
            <DrawerDescription>
              {isLoading && <span>Loading QR code...</span>}
              {error && <span style={{ color: 'red' }}>Error: {error.message}</span>}
              {!isLoading && !error && qrData && (
                <div className='flex justify-center mt-4'>
                  <img src={qrData.qrTag || qrData} alt="QR Code" style={{ width: 300, height: 300 }} />
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default GetQrEvent;
