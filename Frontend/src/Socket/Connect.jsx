import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function Connect() {
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState('');
  const [message, setMessage] = useState('');
  const[chat,setChat]=useState([]);
  

  useEffect(() => {
    const newSocket = io('http://localhost:8000', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server', newSocket.id);
      setSocketId(newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setSocketId('');
    });

    newSocket.on('connect_error', (err) => {
      console.error('🚨 Connection error:', err.message);
    });

    // Use functional state update to ensure the latest state is used
    newSocket.on('message', (data) => {
      console.log('message', data);
      setChat((prevChat) => [...prevChat, data]);  // Use the functional form here
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

const handleSubmit = () => {
  const data = {
    username: socket.id,
    message: message,
  };
  socket.emit('send-message', data, (response) => {});
  console.log(message);
  setMessage('');
}


  return (
    <div className="flex justify-center items-center h-screen flex-col gap-y-5">
      {socketId && <p>Connected as: {socketId}</p>}
      <section>
          <div className='bg-green-300 size-96'>
            <h1 className='text-center text-2xl'>Chat logs</h1>
            {
              chat.length > 0 ? chat.map((data,index)=>{
                return <div className='flex gap-2'>
               <h1 className='text-sm font-semibold text-gray-600'>{data.username.slice(0, 5)}:</h1>
               <h2 >{data.message}</h2>
                </div>
              }):<div className='text-3xl text-center  p-1 my-1'>No chat available</div>
            }
          </div>
      </section>

      <div>
        <h1>enter the message</h1>
        <div className='flex'>
        <input type="text" className="bg-gray-300 focus:outline-none px-3 py-1" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSubmit()} 
/>
        <button className='text-white bg-blue-400 hover:bg-blue-500 px-0.5 focus:outline-none' onClick={(e)=>handleSubmit()}>send</button>
        </div>
      </div>
    </div>
  );
}

export default Connect;
