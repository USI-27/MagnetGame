import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface LobbyProps {
  onJoin: (username: string) => void;
  isConnecting: boolean;
}

export default function Lobby({ onJoin, isConnecting }: LobbyProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length > 0 && username.trim().length <= 20) {
      onJoin(username.trim());
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
              Enter your name to start playing with others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  data-testid="input-username"
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
              
              <Button
                data-testid="button-join"
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
                    Join Game
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t space-y-3">
              <p className="text-sm font-medium text-foreground">How to Play:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Arrow Keys</kbd> to move your magnet</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Spacebar</kbd> to toggle polarity (N/S)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Magnets attract or repel based on polarity</span>
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
