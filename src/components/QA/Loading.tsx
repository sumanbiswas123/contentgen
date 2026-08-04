import React, { useEffect, useState } from "react";
import "./Loading.css";
import { io } from 'socket.io-client';
function Loading() {
  const [progress, setProgress] = useState(0);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io(`${process.env.REACT_APP_SERVER_URL}`);
    setSocket(newSocket);
     console.log(newSocket)
    newSocket.on('progress', (data) => {
      setProgress(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);
  return (
    <div className="loader_body">
      <div className="loader">
        <span className="percentage">{progress}%</span>
      </div>
    </div>
  );
}

export default Loading;
