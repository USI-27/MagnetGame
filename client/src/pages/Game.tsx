import { useEffect, useRef, useState } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { HUD } from "@/components/HUD";
import { GameState, WSMessage, GAME_CONFIG } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface GameProps {
  username: string;
  roomCode?: string;
  onDisconnect: () => void;
}

export default function Game({ username, roomCode, onDisconnect }: GameProps) {
  const [gameState, setGameState] = useState<GameState>({
    players: {},
    magnets: [],
    gamePhase: "waiting",
    worldBounds: { width: GAME_CONFIG.WORLD_WIDTH, height: GAME_CONFIG.WORLD_HEIGHT },
  });
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  
  const wsRef = useRef<WebSocket | null>(null);
  const intentionalDisconnectRef = useRef(false);
  const { toast } = useToast();

  // WebSocket connection
  useEffect(() => {
    intentionalDisconnectRef.current = false;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log("[Game] Attempting WebSocket connection to:", wsUrl);
    console.log("[Game] location.protocol:", window.location.protocol);
    console.log("[Game] location.host:", window.location.host);
    console.log("[Game] location.hostname:", window.location.hostname);
    console.log("[Game] location.port:", window.location.port);
    
    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
    } catch (error) {
      console.error("[Game] Failed to create WebSocket:", error);
      setConnectionStatus("disconnected");
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Could not create WebSocket connection",
      });
      return;
    }

    socket.onopen = () => {
      console.log("[Game] WebSocket connected successfully!");
      setConnectionStatus("connected");
      
      const joinMessage: WSMessage = {
        type: "join",
        username,
        roomCode,
      };
      socket.send(JSON.stringify(joinMessage));
    };

    socket.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);

        switch (message.type) {
          case "welcome":
            console.log("[Game] Welcome! PlayerId:", message.playerId, "Room:", message.roomCode);
            setCurrentPlayerId(message.playerId);
            setCurrentRoomCode(message.roomCode);
            setGameState(message.state);
            toast({
              title: "Connected!",
              description: `Room ${message.roomCode} - Welcome, ${username}!`,
            });
            break;

          case "game_state":
            console.log("[Game] State update - Phase:", message.state.gamePhase, "Players:", Object.keys(message.state.players).length);
            setGameState(message.state);
            break;

          case "player_joined":
            setGameState((prev) => ({
              ...prev,
              players: {
                ...prev.players,
                [message.player.id]: message.player,
              },
            }));
            toast({
              title: "Player joined",
              description: `${message.player.username} joined the game`,
            });
            break;

          case "player_left":
            setGameState((prev) => {
              const newPlayers = { ...prev.players };
              delete newPlayers[message.playerId];
              return { ...prev, players: newPlayers };
            });
            break;

          case "room_full":
            toast({
              variant: "destructive",
              title: "Room Full",
              description: "This room is at maximum capacity",
            });
            setTimeout(onDisconnect, 2000);
            break;

          case "room_not_found":
            toast({
              variant: "destructive",
              title: "Room Not Found",
              description: "Could not find the requested room",
            });
            setTimeout(onDisconnect, 2000);
            break;

          case "game_started":
            toast({
              title: "🎮 Game Started!",
              description: "Place your magnets strategically",
              className: "bg-green-900 border-green-600 text-white",
            });
            break;

          case "magnets_moved":
            toast({
              title: "⚡ Magnetic Interference!",
              description: `${message.movedMagnets.length} magnet(s) moved and must be replaced`,
              className: "bg-amber-900 border-amber-600 text-white",
            });
            break;

          case "game_over":
            toast({
              title: "🏆 Game Over!",
              description: `${message.winner.username} wins!`,
              className: "bg-purple-900 border-purple-600 text-white",
            });
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("[Game] WebSocket error:", error);
      console.error("[Game] Socket state:", socket.readyState);
      setConnectionStatus("disconnected");
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Failed to connect to game server",
      });
    };

    socket.onclose = (event) => {
      console.log("[Game] WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
      setConnectionStatus("disconnected");
      
      // Only show toast and redirect if this wasn't an intentional disconnect
      if (!intentionalDisconnectRef.current) {
        toast({
          title: "Disconnected",
          description: "Connection to server lost",
        });
        setTimeout(onDisconnect, 2000);
      }
    };

    wsRef.current = socket;

    return () => {
      intentionalDisconnectRef.current = true;
      socket.close();
    };
  }, [username, roomCode, onDisconnect, toast]);

  const handleReady = () => {
    console.log("[Game] Ready button clicked");
    console.log("[Game] WebSocket state:", wsRef.current?.readyState);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: WSMessage = { type: "player_ready" };
      console.log("[Game] Sending player_ready message");
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error("[Game] WebSocket not open, cannot send ready message");
    }
  };

  const handlePlaceMagnet = (x: number, y: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: WSMessage = { type: "place_magnet", x, y };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleSetMagnetCount = (count: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: WSMessage = { type: "set_magnet_count", magnetCount: count };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return (
    <div 
      className="w-full h-screen overflow-hidden" 
      style={{ backgroundColor: '#0f172a' }}
      data-testid="game-container"
    >
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <div className="relative">
          <GameCanvas
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPlaceMagnet={handlePlaceMagnet}
          />
        </div>
        
        <HUD
          gameState={gameState}
          currentPlayerId={currentPlayerId}
          connectionStatus={connectionStatus}
          roomCode={currentRoomCode}
          onReady={handleReady}
          onSetMagnetCount={handleSetMagnetCount}
        />
      </div>
    </div>
  );
}
