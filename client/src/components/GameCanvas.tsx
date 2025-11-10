import { useEffect, useRef } from "react";
import { Player, GAME_CONFIG } from "@shared/schema";

interface GameCanvasProps {
  players: Record<string, Player>;
  currentPlayerId: string | null;
  worldBounds: { width: number; height: number };
}

export function GameCanvas({ players, currentPlayerId, worldBounds }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    fromId: string;
    toId: string;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const scale = Math.min(
        containerWidth / worldBounds.width,
        containerHeight / worldBounds.height
      );

      canvas.width = worldBounds.width * scale;
      canvas.height = worldBounds.height * scale;
      canvas.style.width = `${worldBounds.width * scale}px`;
      canvas.style.height = `${worldBounds.height * scale}px`;

      // Reset transform to prevent cumulative scaling on resize
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(scale, scale);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, worldBounds.width, worldBounds.height);

      // Draw grid background
      ctx.strokeStyle = "rgba(128, 128, 128, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x < worldBounds.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, worldBounds.height);
        ctx.stroke();
      }
      for (let y = 0; y < worldBounds.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(worldBounds.width, y);
        ctx.stroke();
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        if (p.life > 0) {
          ctx.fillStyle = `rgba(128, 128, 255, ${p.life * 0.3})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      // Draw force lines between interacting magnets
      const playerArray = Object.values(players);
      for (let i = 0; i < playerArray.length; i++) {
        for (let j = i + 1; j < playerArray.length; j++) {
          const p1 = playerArray[i];
          const p2 = playerArray[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < GAME_CONFIG.MAX_FORCE_DISTANCE && distance > GAME_CONFIG.MIN_FORCE_DISTANCE) {
            const force = (p1.polarity * p2.polarity * GAME_CONFIG.MAGNETIC_STRENGTH) / (distance * distance);
            const opacity = Math.min(0.3, Math.abs(force) / 100);

            // Attraction (opposite polarities) - curved line
            if (force < 0) {
              ctx.strokeStyle = `rgba(100, 200, 255, ${opacity})`;
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const controlX = midX + (p2.y - p1.y) * 0.1;
              const controlY = midY - (p2.x - p1.x) * 0.1;
              ctx.quadraticCurveTo(controlX, controlY, p2.x, p2.y);
              ctx.stroke();
              ctx.setLineDash([]);

              // Spawn attraction particles
              if (Math.random() < 0.1) {
                particlesRef.current.push({
                  x: p1.x,
                  y: p1.y,
                  vx: dx / distance * 2,
                  vy: dy / distance * 2,
                  life: 1,
                  fromId: p1.id,
                  toId: p2.id,
                });
              }
            }
            // Repulsion (same polarities) - radiating lines
            else if (force > 0) {
              ctx.strokeStyle = `rgba(255, 100, 100, ${opacity})`;
              ctx.lineWidth = 1.5;
              const angle = Math.atan2(dy, dx);
              const offset = 10;
              
              for (let k = -1; k <= 1; k++) {
                const spreadAngle = angle + k * 0.2;
                const startX = p1.x + Math.cos(spreadAngle) * GAME_CONFIG.MAGNET_RADIUS;
                const startY = p1.y + Math.sin(spreadAngle) * GAME_CONFIG.MAGNET_RADIUS;
                const endX = startX + Math.cos(spreadAngle) * offset * 3;
                const endY = startY + Math.sin(spreadAngle) * offset * 3;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Draw magnets
      Object.values(players).forEach((player) => {
        const isCurrentPlayer = player.id === currentPlayerId;

        // Glow effect for current player
        if (isCurrentPlayer) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = player.color;
        } else {
          ctx.shadowBlur = 8;
          ctx.shadowColor = player.color;
        }

        // Outer ring (polarity indicator)
        ctx.strokeStyle = player.polarity === 1 ? "#60A5FA" : "#F87171";
        ctx.lineWidth = isCurrentPlayer ? 4 : 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, GAME_CONFIG.MAGNET_RADIUS + 3, 0, Math.PI * 2);
        ctx.stroke();

        // Main magnet body
        const gradient = ctx.createRadialGradient(
          player.x - 5,
          player.y - 5,
          5,
          player.x,
          player.y,
          GAME_CONFIG.MAGNET_RADIUS
        );
        gradient.addColorStop(0, player.color);
        gradient.addColorStop(1, adjustColorBrightness(player.color, -20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, GAME_CONFIG.MAGNET_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Polarity symbol
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(player.polarity === 1 ? "N" : "S", player.x, player.y);

        // Player name
        ctx.fillStyle = isCurrentPlayer ? player.color : "#666666";
        ctx.font = "500 12px Inter, sans-serif";
        ctx.fillText(
          player.username,
          player.x,
          player.y - GAME_CONFIG.MAGNET_RADIUS - 12
        );

        // Velocity indicator (small arrow)
        if (Math.abs(player.vx) > 0.5 || Math.abs(player.vy) > 0.5) {
          const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
          const angle = Math.atan2(player.vy, player.vx);
          const arrowLength = Math.min(speed * 5, 30);
          
          ctx.strokeStyle = player.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(
            player.x + Math.cos(angle) * GAME_CONFIG.MAGNET_RADIUS,
            player.y + Math.sin(angle) * GAME_CONFIG.MAGNET_RADIUS
          );
          ctx.lineTo(
            player.x + Math.cos(angle) * (GAME_CONFIG.MAGNET_RADIUS + arrowLength),
            player.y + Math.sin(angle) * (GAME_CONFIG.MAGNET_RADIUS + arrowLength)
          );
          ctx.stroke();

          // Arrowhead
          const arrowHeadSize = 6;
          ctx.fillStyle = player.color;
          ctx.beginPath();
          ctx.moveTo(
            player.x + Math.cos(angle) * (GAME_CONFIG.MAGNET_RADIUS + arrowLength),
            player.y + Math.sin(angle) * (GAME_CONFIG.MAGNET_RADIUS + arrowLength)
          );
          ctx.lineTo(
            player.x + Math.cos(angle - 2.5) * (GAME_CONFIG.MAGNET_RADIUS + arrowLength - arrowHeadSize),
            player.y + Math.sin(angle - 2.5) * (GAME_CONFIG.MAGNET_RADIUS + arrowLength - arrowHeadSize)
          );
          ctx.lineTo(
            player.x + Math.cos(angle + 2.5) * (GAME_CONFIG.MAGNET_RADIUS + arrowLength - arrowHeadSize),
            player.y + Math.sin(angle + 2.5) * (GAME_CONFIG.MAGNET_RADIUS + arrowLength - arrowHeadSize)
          );
          ctx.closePath();
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [players, currentPlayerId, worldBounds]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-border rounded-lg shadow-lg bg-card"
      data-testid="game-canvas"
    />
  );
}

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
