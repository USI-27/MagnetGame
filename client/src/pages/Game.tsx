import { useEffect, useRef, useState, useCallback } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { HUD } from "@/components/HUD";
import { GameState, WSMessage, GAME_CONFIG } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface GameProps {
  username: string;
  onDisconnect: () => void;
}

export default function Game({ username, onDisconnect }: GameProps) {
  const [gameState, setGameState] = useState<GameState>({
    players: {},
    worldBounds: { width: GAME_CONFIG.WORLD_WIDTH, height: GAME_CONFIG.WORLD_HEIGHT },
  });
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  
  const wsRef = useRef<WebSocket | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  // WebSocket connection
  useEffect(() => {
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
      };
      socket.send(JSON.stringify(joinMessage));
    };

    socket.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);

        switch (message.type) {
          case "welcome":
            setCurrentPlayerId(message.playerId);
            setGameState(message.state);
            toast({
              title: "Connected!",
              description: `Welcome to the game, ${username}!`,
            });
            break;

          case "game_state":
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
      toast({
        title: "Disconnected",
        description: "Connection to server lost",
      });
      setTimeout(onDisconnect, 2000);
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [username, onDisconnect, toast]);

  // Input handling
  const sendInput = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    let x = 0;
    let y = 0;

    if (keysPressed.current.has("ArrowUp") || keysPressed.current.has("w")) y -= 1;
    if (keysPressed.current.has("ArrowDown") || keysPressed.current.has("s")) y += 1;
    if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("a")) x -= 1;
    if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("d")) x += 1;

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }

    const inputMessage: WSMessage = {
      type: "input",
      direction: { x, y },
    };
    wsRef.current.send(JSON.stringify(inputMessage));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      
      // Toggle polarity with spacebar
      if (key === " ") {
        e.preventDefault();
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const message: WSMessage = { type: "toggle_polarity" };
          wsRef.current.send(JSON.stringify(message));
        }
        return;
      }

      // Movement keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
        keysPressed.current.delete(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Send input updates at 60fps
    const inputInterval = setInterval(sendInput, 1000 / 60);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(inputInterval);
    };
  }, [sendInput]);

  return (
    <div className="w-full h-screen bg-background overflow-hidden" data-testid="game-container">
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <GameCanvas
          players={gameState.players}
          currentPlayerId={currentPlayerId}
          worldBounds={gameState.worldBounds}
        />
        
        <HUD
          players={gameState.players}
          currentPlayerId={currentPlayerId}
          connectionStatus={connectionStatus}
        />
      </div>
    </div>
  );
}
