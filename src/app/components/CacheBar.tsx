import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';
const TOTAL_SECONDS = 30;

let sharedSocket: ReturnType<typeof io> | null = null;

function getSharedSocket() {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, { withCredentials: true });
  }
  return sharedSocket;
}

export function CacheBar() {
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_SECONDS);

  useEffect(() => {
    const socket = getSharedSocket();

    const handler = ({ secondsRemaining: secs }: { secondsRemaining: number }) => {
      setSecondsRemaining(secs);
    };

    socket.on('trending:cacheAge', handler);

    // Fallback: local countdown if Socket.io events are not received
    const fallback = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 0) return TOTAL_SECONDS;
        return prev - 1;
      });
    }, 1000);

    // Clean up fallback when socket data arrives
    socket.on('trending:cacheAge', () => clearInterval(fallback));

    return () => {
      socket.off('trending:cacheAge', handler);
      clearInterval(fallback);
    };
  }, []);

  const progress = ((TOTAL_SECONDS - secondsRemaining) / TOTAL_SECONDS) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 h-[1px] bg-transparent z-50">
      <div
        className="h-full bg-[#FF5C35] opacity-40 transition-all duration-[1000ms] ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
