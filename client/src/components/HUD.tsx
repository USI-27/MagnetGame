import { GameState, GAME_CONFIG } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, Trophy } from "lucide-react";

interface HUDProps {
  gameState: GameState;
  currentPlayerId: string | null;
  connectionStatus: "connected" | "connecting" | "disconnected";
  roomCode: string | null;
  onReady: () => void;
  onSetMagnetCount?: (count: number) => void;
}

export function HUD({ gameState, currentPlayerId, connectionStatus, roomCode, onReady, onSetMagnetCount }: HUDProps) {
  const currentPlayer = currentPlayerId ? gameState.players[currentPlayerId] : null;
  const playerCount = Object.keys(gameState.players).length;
  const isMyTurn = gameState.currentTurn === currentPlayerId;
  const currentTurnPlayer = gameState.currentTurn ? gameState.players[gameState.currentTurn] : null;

  console.log("[HUD] Render - gamePhase:", gameState.gamePhase, "currentPlayer:", currentPlayer?.username, "isReady:", currentPlayer?.isReady);

  return (
    <>
      {/* Top Left - Game Info */}
      <div className="absolute top-4 left-4 space-y-2 z-50" data-testid="hud-top-left">
        <Card className="shadow-lg" style={{ backgroundColor: '#1e293b', borderColor: '#475569' }}>
          <CardContent className="p-3 space-y-2">
            {roomCode && (
              <div className="flex items-center gap-2 pb-2 border-b border-gray-600">
                <span className="text-xs text-gray-400">Room Code:</span>
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
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white" data-testid="text-player-count">
                Players: {playerCount}/{GAME_CONFIG.MAX_PLAYERS_PER_ROOM}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Phase:</span>
              <Badge 
                variant={gameState.gamePhase === "playing" ? "default" : "secondary"}
                data-testid="badge-game-phase"
              >
                {gameState.gamePhase || "waiting"}
              </Badge>
            </div>
            
            {currentPlayer && gameState.gamePhase === "playing" && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">
                  Magnets Left: {currentPlayer.magnetsRemaining}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Magnet Preview */}
        {currentPlayer && gameState.gamePhase === "playing" && (
          <Card className="shadow-lg" style={{ backgroundColor: '#1e293b', borderColor: '#475569' }}>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground mb-2">Next Magnet:</div>
              {currentPlayer.magnets?.find(m => !m.isPlaced) ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-gray-700 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Ready to place
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">All placed!</span>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Right - Connection Status */}
      <div className="absolute top-4 right-4 z-50" data-testid="hud-top-right">
        <Card className="shadow-lg" style={{ backgroundColor: '#1e293b', borderColor: '#475569' }}>
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
              <span className="text-sm font-medium capitalize text-white">
                {connectionStatus}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center - Turn Indicator */}
      {gameState.gamePhase === "playing" && currentTurnPlayer && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 space-y-2" data-testid="hud-turn-indicator">
          <Card className={`shadow-xl backdrop-blur-sm ${
            isMyTurn ? "bg-primary/20 border-primary" : "bg-card/95"
          }`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {isMyTurn ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-bold">YOUR TURN</span>
                  </>
                ) : (
                  <>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: currentTurnPlayer.color }}
                    />
                    <span className="text-sm font-medium">
                      {currentTurnPlayer.username}'s Turn
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Settling Indicator */}
          {gameState.magnets?.some(m => m.isSettling) && (
            <Card className="shadow-xl backdrop-blur-sm bg-yellow-500/20 border-yellow-500">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-sm font-medium">Magnets Settling...</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Center - Waiting for Players */}
      {(gameState.gamePhase === "waiting" || !gameState.gamePhase) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50" data-testid="hud-waiting">
          <Card className="shadow-xl border-2" style={{ backgroundColor: '#1e293b', borderColor: '#3b82f6' }}>
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Waiting for Players</h2>
              <p className="text-gray-300">
                {playerCount}/{GAME_CONFIG.MAX_PLAYERS_PER_ROOM} players ready
              </p>
              
              {/* Magnet Count Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-white">
                  Magnets per player: {gameState.magnetCount || GAME_CONFIG.MAGNETS_PER_PLAYER}
                </label>
                <input
                  type="range"
                  min={GAME_CONFIG.MIN_MAGNETS_PER_PLAYER}
                  max={GAME_CONFIG.MAX_MAGNETS_PER_PLAYER}
                  value={gameState.magnetCount || GAME_CONFIG.MAGNETS_PER_PLAYER}
                  onChange={(e) => onSetMagnetCount?.(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={currentPlayer?.isReady}
                />
                <p className="text-xs text-gray-400">
                  {GAME_CONFIG.MIN_MAGNETS_PER_PLAYER}-{GAME_CONFIG.MAX_MAGNETS_PER_PLAYER} magnets
                </p>
              </div>
              
              {currentPlayer && !currentPlayer.isReady && (
                <Button 
                  onClick={() => {
                    console.log("[HUD] Ready button clicked!");
                    onReady();
                  }} 
                  size="lg" 
                  className="w-full"
                >
                  Ready to Play
                </Button>
              )}
              {currentPlayer?.isReady && (
                <Badge variant="outline" className="text-sm">
                  Waiting for other players...
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Center - Game Over */}
      {gameState.gamePhase === "finished" && gameState.winner && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" data-testid="hud-game-over">
          <Card className="shadow-xl backdrop-blur-sm bg-card/95 border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
              <h2 className="text-3xl font-bold">Game Over!</h2>
              <p className="text-xl">
                {gameState.players[gameState.winner]?.username} wins!
              </p>
              {gameState.winner === currentPlayerId && (
                <Badge variant="default" className="text-lg px-4 py-2">
                  You Won! 🎉
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Center - Instructions */}
      {gameState.gamePhase === "playing" && isMyTurn && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2" data-testid="hud-instructions">
          <Card className="shadow-xl backdrop-blur-sm bg-card/95 border-primary/20">
            <CardContent className="p-4">
              <div className="text-sm text-center">
                <span className="font-medium">Click on the board to place your magnet</span>
                <div className="text-xs text-muted-foreground mt-1">
                  If magnets move, they'll be picked back up!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Player List - Bottom Left */}
      <div className="absolute bottom-4 left-4 max-w-xs z-50" data-testid="hud-player-list">
        <Card className="shadow-lg" style={{ backgroundColor: '#1e293b', borderColor: '#475569' }}>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-400 mb-2">Players</div>
              <div className="space-y-2">
                {Object.values(gameState.players).map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 text-sm"
                    data-testid={`player-item-${player.id}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className={player.id === currentPlayerId ? "font-medium text-white" : "text-gray-400"}>
                      {player.username}
                    </span>
                    {gameState.gamePhase === "playing" && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {player.magnetsRemaining} left
                      </Badge>
                    )}
                    {gameState.gamePhase === "waiting" && player.isReady && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Ready
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
