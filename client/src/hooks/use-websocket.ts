import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'connected':
                break;
                
              case 'access-update':
                // Invalidate access-related queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['/api/dashboard/wave-chart'] });
                queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
                queryClient.invalidateQueries({ queryKey: ['/api/access-logs'] });
                break;
                
              case 'device-update':
                // Invalidate device-related queries
                queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
                queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
                break;
                
              default:
            }
          } catch (error) {
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          setIsConnected(false);
        };

      } catch (error) {
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [queryClient]);

  return {
    isConnected,
    sendMessage: (message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    }
  };
}