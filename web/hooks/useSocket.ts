import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export const useSocket = (roomId?: string) => {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    }

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Web Connected to socket');
      if (roomId) {
        socket.emit('join_room', { roomId });
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  return socketRef.current;
};
