import { Player } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface HUDProps {
  players: Record<string, Player>;
  currentPlayerId: string | null;
  connectionStatus: "connected" | "connecting" | "disconnected";
  roomCode: string | null;
}

export function HUD({ players, currentPlayerId, connectionStatus, roomCode }: HUDProps) {
  const currentPlayer = currentPlayerId ? players[currentPlayerId] : null;
  const playerCount = Object.keys(players).length;
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Top Left - Player Info */}
      <div className="absolute top-4 left-4 space-y-2" data-testid="hud-top-left">
        <Card className="shadow-lg backdrop-blur-sm bg-card/95">
          <CardContent className="p-3 space-y-2">
            {roomCode && (
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <span className="text-xs text-muted-foreground">Room Code:</span>
                <Badge 
                  variant="outline" 
                  className="font-mono text-sm"
                  data-testid="badge-room-code"
                >
                  {roomCode}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium" data-testid="text-player-count">
                Players: {playerCount}
              </span>
            </div>
            
            {currentPlayer && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium" data-testid="text-polarity">
                  Polarity: 
                </span>
                <Badge 
                  variant={currentPlayer.polarity === 1 ? "default" : "destructive"}
                  className="ml-1"
                  data-testid="badge-polarity-value"
                >
                  {currentPlayer.polarity === 1 ? "North" : "South"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Right - Connection Status */}
      <div className="absolute top-4 right-4" data-testid="hud-top-right">
        <Card className="shadow-lg backdrop-blur-sm bg-card/95">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected" 
                    ? "bg-green-500 animate-pulse" 
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
                }`}
                data-testid="indicator-connection"
              />
              <span className="text-sm font-medium capitalize">
                {connectionStatus}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Center - Instructions */}
      {showInstructions && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-500"
          style={{ opacity: showInstructions ? 1 : 0 }}
          data-testid="hud-instructions"
        >
          <Card className="shadow-xl backdrop-blur-sm bg-card/95 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">↑ ↓ ← →</kbd>
                  <span className="text-muted-foreground">Move</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd>
                  <span className="text-muted-foreground">Toggle Polarity</span>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-dismiss-instructions"
                >
                  Dismiss
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Player List - Bottom Left */}
      {playerCount > 1 && (
        <div className="absolute bottom-4 left-4 max-w-xs" data-testid="hud-player-list">
          <Card className="shadow-lg backdrop-blur-sm bg-card/95">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Active Players</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.values(players).map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 text-sm"
                      data-testid={`player-item-${player.id}`}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className={player.id === currentPlayerId ? "font-medium" : "text-muted-foreground"}>
                        {player.username}
                      </span>
                      <Badge 
                        variant="outline" 
                        className="ml-auto text-xs"
                      >
                        {player.polarity === 1 ? "N" : "S"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
