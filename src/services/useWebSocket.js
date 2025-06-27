import { useEffect, useState } from 'react';

 const useWebSocket = (url) => {
     const [messages, setMessages] = useState([]);
     const [ws, setWs] = useState(null);

     useEffect(() => {
         const socket = new WebSocket(url);
         setWs(socket);

         socket.onmessage = (event) => {
             setMessages((prevMessages) => [...prevMessages, event.data]);
             console.log('New message received:', event.data);
         };

         return () => {
             socket.close();
         };
     }, [url]);
     return { messages };
 };

 export default useWebSocket;