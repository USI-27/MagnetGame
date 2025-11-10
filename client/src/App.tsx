import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Lobby from "@/pages/Lobby";
import Game from "@/pages/Game";

type AppState = "lobby" | "game";

function App() {
  const [appState, setAppState] = useState<AppState>("lobby");
  const [username, setUsername] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleJoin = (name: string, code?: string) => {
    setUsername(name);
    setRoomCode(code);
    setIsConnecting(true);
    setAppState("game");
  };

  const handleDisconnect = () => {
    setAppState("lobby");
    setUsername("");
    setRoomCode(undefined);
    setIsConnecting(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {appState === "lobby" && (
          <Lobby onJoin={handleJoin} isConnecting={isConnecting} />
        )}
        {appState === "game" && username && (
          <Game username={username} roomCode={roomCode} onDisconnect={handleDisconnect} />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
