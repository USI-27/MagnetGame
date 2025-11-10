import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Key, Dices } from "lucide-react";

interface LobbyProps {
  onJoin: (username: string, roomCode?: string) => void;
  isConnecting: boolean;
}

export default function Lobby({ onJoin, isConnecting }: LobbyProps) {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [magnetCount, setMagnetCount] = useState(8);
  const [activeTab, setActiveTab] = useState<"quick" | "join" | "create">("quick");

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length > 0 && username.trim().length <= 20) {
      onJoin(username.trim());
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length > 0 && username.trim().length <= 20 && roomCode.trim().length === 6) {
      onJoin(username.trim(), roomCode.trim().toUpperCase());
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length > 0 && username.trim().length <= 20) {
      // Generate a random room code on client side
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      onJoin(username.trim(), code);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 animate-pulse"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Magnet Game
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time Multiplayer Physics
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Join the Game</CardTitle>
            <CardDescription>
              Choose how you want to play
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="quick" data-testid="tab-quick-join">
                  <Users className="w-4 h-4 mr-2" />
                  Quick
                </TabsTrigger>
                <TabsTrigger value="join" data-testid="tab-join-room">
                  <Key className="w-4 h-4 mr-2" />
                  Join
                </TabsTrigger>
                <TabsTrigger value="create" data-testid="tab-create-room">
                  <Dices className="w-4 h-4 mr-2" />
                  Create
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Join any available room instantly
                </p>
                <form onSubmit={handleQuickJoin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      data-testid="input-username-quick"
                      type="text"
                      placeholder="Your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      disabled={isConnecting}
                      className="h-12 text-base"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      {username.length}/20 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Magnets per player: {magnetCount}</label>
                    <Input
                      type="range"
                      min="3"
                      max="15"
                      value={magnetCount}
                      onChange={(e) => setMagnetCount(parseInt(e.target.value))}
                      disabled={isConnecting}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose between 3-15 magnets (default: 8)
                    </p>
                  </div>
                  
                  <Button
                    data-testid="button-quick-join"
                    type="submit"
                    className="w-full h-12 text-base font-medium"
                    disabled={username.trim().length === 0 || username.trim().length > 20 || isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        Quick Join
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="join" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Enter a room code to join your friends
                </p>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      data-testid="input-username-join"
                      type="text"
                      placeholder="Your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      disabled={isConnecting}
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      {username.length}/20 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Input
                      data-testid="input-room-code"
                      type="text"
                      placeholder="Room code (6 characters)"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      disabled={isConnecting}
                      className="h-12 text-base font-mono tracking-wider"
                    />
                    <p className="text-xs text-muted-foreground">
                      {roomCode.length}/6 characters
                    </p>
                  </div>
                  
                  <Button
                    data-testid="button-join-room"
                    type="submit"
                    className="w-full h-12 text-base font-medium"
                    disabled={
                      username.trim().length === 0 || 
                      username.trim().length > 20 || 
                      roomCode.trim().length !== 6 || 
                      isConnecting
                    }
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5 mr-2" />
                        Join Room
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="create" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Create a private room and share the code
                </p>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      data-testid="input-username-create"
                      type="text"
                      placeholder="Your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      disabled={isConnecting}
                      className="h-12 text-base"
                      autoFocus={activeTab === "create"}
                    />
                    <p className="text-xs text-muted-foreground">
                      {username.length}/20 characters
                    </p>
                  </div>
                  
                  <Button
                    data-testid="button-create-room"
                    type="submit"
                    className="w-full h-12 text-base font-medium"
                    disabled={username.trim().length === 0 || username.trim().length > 20 || isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Dices className="w-5 h-5 mr-2" />
                        Create Room
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t space-y-3">
              <p className="text-sm font-medium text-foreground">How to Play:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Arrow Keys</kbd> to move your magnet</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>All magnets attract each other (like real magnets)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Watch magnets settle after placement - movement takes time!</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Built with WebSockets for real-time physics simulation
        </p>
      </div>
    </div>
  );
}
