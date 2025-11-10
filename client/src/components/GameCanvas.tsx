import { useEffect, useRef, useState } from "react";
import { GameState, Magnet, GAME_CONFIG } from "@shared/schema";

interface GameCanvasProps {
  gameState: GameState;
  currentPlayerId: string | null;
  onPlaceMagnet: (x: number, y: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function GameCanvas({ gameState, currentPlayerId, onPlaceMagnet }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const particlesRef = useRef<Particle[]>([]);

  const isMyTurn = gameState.currentTurn === currentPlayerId;
  const currentPlayer = currentPlayerId ? gameState.players[currentPlayerId] : null;
  const nextMagnet = currentPlayer?.magnets?.find(m => !m.isPlaced);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || gameState.gamePhase !== "playing" || !nextMagnet) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    onPlaceMagnet(x, y);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || gameState.gamePhase !== "playing" || !nextMagnet) {
      setHoveredPosition(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setHoveredPosition({ x, y });
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || gameState.gamePhase !== "playing" || !nextMagnet) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / scale;
    const y = (touch.clientY - rect.top) / scale;

    setHoveredPosition({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || gameState.gamePhase !== "playing" || !nextMagnet) {
      setHoveredPosition(null);
      return;
    }
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / scale;
    const y = (touch.clientY - rect.top) / scale;

    setHoveredPosition({ x, y });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || gameState.gamePhase !== "playing" || !nextMagnet) return;
    e.preventDefault();

    if (hoveredPosition) {
      onPlaceMagnet(hoveredPosition.x, hoveredPosition.y);
    }
    setHoveredPosition(null);
  };

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

      const newScale = Math.min(
        containerWidth / gameState.worldBounds.width,
        containerHeight / gameState.worldBounds.height
      );

      setScale(newScale);

      canvas.width = gameState.worldBounds.width * newScale;
      canvas.height = gameState.worldBounds.height * newScale;
      canvas.style.width = `${gameState.worldBounds.width * newScale}px`;
      canvas.style.height = `${gameState.worldBounds.height * newScale}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(newScale, newScale);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, gameState.worldBounds.width, gameState.worldBounds.height);

      // Draw grid background
      ctx.strokeStyle = "rgba(128, 128, 128, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x < gameState.worldBounds.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameState.worldBounds.height);
        ctx.stroke();
      }
      for (let y = 0; y < gameState.worldBounds.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameState.worldBounds.width, y);
        ctx.stroke();
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        if (p.life > 0) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          return true;
        }
        return false;
      });

      // Draw force lines between magnets with enhanced visuals
      const placedMagnets = gameState.magnets?.filter(m => m.isPlaced) || [];
      for (let i = 0; i < placedMagnets.length; i++) {
        for (let j = i + 1; j < placedMagnets.length; j++) {
          const m1 = placedMagnets[i];
          const m2 = placedMagnets[j];
          const dx = m2.x - m1.x;
          const dy = m2.y - m1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < GAME_CONFIG.MAX_FORCE_DISTANCE && distance > GAME_CONFIG.MIN_FORCE_DISTANCE) {
            // All magnets attract (like real magnets)
            const force = -GAME_CONFIG.MAGNETIC_STRENGTH / (distance * distance);
            const opacity = Math.min(0.5, Math.abs(force) / 80);

            // Attraction - beautiful glowing animated lines
            const gradient = ctx.createLinearGradient(m1.x, m1.y, m2.x, m2.y);
            gradient.addColorStop(0, `rgba(100, 200, 255, ${opacity * 0.8})`);
            gradient.addColorStop(0.5, `rgba(150, 220, 255, ${opacity})`);
            gradient.addColorStop(1, `rgba(100, 200, 255, ${opacity * 0.8})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4;
            ctx.setLineDash([12, 8]);
            ctx.lineDashOffset = -(Date.now() / 25) % 20;
            ctx.beginPath();
            ctx.moveTo(m1.x, m1.y);
            ctx.lineTo(m2.x, m2.y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Spawn attraction particles
            if (Math.random() < 0.15) {
              const t = Math.random();
              particlesRef.current.push({
                x: m1.x + dx * t,
                y: m1.y + dy * t,
                vx: (dx / distance) * 2,
                vy: (dy / distance) * 2,
                life: 1,
                color: `rgba(100, 200, 255, ${opacity})`,
              });
            }
          }
        }
      }

      // Draw placed magnets with field interaction indicators
      placedMagnets.forEach((magnet) => {
        // If hovering and this magnet is within range, show interaction
        if (hoveredPosition && isMyTurn && nextMagnet) {
          const dx = hoveredPosition.x - magnet.x;
          const dy = hoveredPosition.y - magnet.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < GAME_CONFIG.MAX_FORCE_DISTANCE && distance > GAME_CONFIG.MIN_FORCE_DISTANCE) {
            // Draw attraction indicator line
            const strength = 1 - (distance / GAME_CONFIG.MAX_FORCE_DISTANCE);
            const opacity = strength * 0.4;
            
            const gradient = ctx.createLinearGradient(magnet.x, magnet.y, hoveredPosition.x, hoveredPosition.y);
            gradient.addColorStop(0, `rgba(100, 200, 255, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(150, 220, 255, ${opacity * 1.2})`);
            gradient.addColorStop(1, `rgba(100, 200, 255, ${opacity * 0.5})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2 + strength * 2;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(magnet.x, magnet.y);
            ctx.lineTo(hoveredPosition.x, hoveredPosition.y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Highlight the magnet that will be affected
            ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 1.5})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(magnet.x, magnet.y, GAME_CONFIG.MAGNET_RADIUS * 2.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        
        drawMagnet(ctx, magnet, "#6B7280", false);
      });

      // Draw hover preview with realistic magnetic field visualization
      if (hoveredPosition && isMyTurn && nextMagnet) {
        const maxRadius = GAME_CONFIG.MAX_FORCE_DISTANCE;
        const pulsePhase = (Date.now() / 800) % 1;
        
        // Draw multiple gradient rings to show field strength (stronger near center)
        for (let i = 0; i < 5; i++) {
          const ringRadius = maxRadius * (1 - i * 0.18); // 100%, 82%, 64%, 46%, 28%
          const opacity = 0.08 + (i * 0.04); // Stronger opacity for inner rings
          
          const gradient = ctx.createRadialGradient(
            hoveredPosition.x, hoveredPosition.y, ringRadius * 0.7,
            hoveredPosition.x, hoveredPosition.y, ringRadius
          );
          gradient.addColorStop(0, `rgba(100, 200, 255, ${opacity})`);
          gradient.addColorStop(1, `rgba(100, 200, 255, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(hoveredPosition.x, hoveredPosition.y, ringRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw outer boundary ring with pulsing effect
        const pulseRadius = maxRadius * (1 + pulsePhase * 0.05);
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 - pulsePhase * 0.2})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(hoveredPosition.x, hoveredPosition.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw inner strong field indicator
        ctx.strokeStyle = `rgba(100, 200, 255, 0.6)`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(hoveredPosition.x, hoveredPosition.y, maxRadius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw magnet preview
        ctx.globalAlpha = 0.75;
        drawMagnet(ctx, {
          ...nextMagnet,
          x: hoveredPosition.x,
          y: hoveredPosition.y,
        }, "#6B7280", true);
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, hoveredPosition, isMyTurn, nextMagnet, currentPlayer, scale]);

  return (
    <canvas
      ref={canvasRef}
      className={isMyTurn && gameState.gamePhase === "playing" ? "cursor-crosshair" : "cursor-default"}
      style={{ 
        minWidth: "800px", 
        minHeight: "600px",
        backgroundColor: "#1e293b",
        border: "2px solid #475569",
        borderRadius: "8px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMove}
      onMouseLeave={() => setHoveredPosition(null)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setHoveredPosition(null)}
      data-testid="game-canvas"
    />
  );
}

function drawMagnet(
  ctx: CanvasRenderingContext2D,
  magnet: Magnet,
  color: string,
  isPreview: boolean
) {
  const physicsRadius = GAME_CONFIG.MAGNET_RADIUS; // Physics collision radius (12px)
  const visualRadius = physicsRadius * 2.2; // Visual size (26.4px) - much bigger and cuter!

  // Animated outer glow/aura effect
  if (!isPreview) {
    const pulsePhase = (Date.now() / 1000) % 2;
    const pulseIntensity = 0.3 + Math.sin(pulsePhase * Math.PI) * 0.2;
    
    const auraGradient = ctx.createRadialGradient(
      magnet.x, magnet.y, visualRadius * 0.8,
      magnet.x, magnet.y, visualRadius * 1.5
    );
    auraGradient.addColorStop(0, `rgba(100, 200, 255, ${pulseIntensity})`);
    auraGradient.addColorStop(0.5, `rgba(100, 200, 255, ${pulseIntensity * 0.5})`);
    auraGradient.addColorStop(1, "rgba(100, 200, 255, 0)");
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(magnet.x, magnet.y, visualRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow for depth
  ctx.shadowBlur = 15;
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Main magnet body - glossy sphere effect with beautiful gradient
  const bodyGradient = ctx.createRadialGradient(
    magnet.x - visualRadius * 0.3,
    magnet.y - visualRadius * 0.3,
    visualRadius * 0.1,
    magnet.x,
    magnet.y,
    visualRadius
  );
  
  // Beautiful gradient: light cyan to deep blue
  bodyGradient.addColorStop(0, "#E0F2FE");
  bodyGradient.addColorStop(0.2, "#BAE6FD");
  bodyGradient.addColorStop(0.5, "#7DD3FC");
  bodyGradient.addColorStop(0.8, "#38BDF8");
  bodyGradient.addColorStop(1, "#0284C7");
  
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(magnet.x, magnet.y, visualRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Glossy border
  ctx.strokeStyle = "#0369A1";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(magnet.x, magnet.y, visualRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Top highlight shine (makes it look 3D and glossy like a marble)
  const shineGradient = ctx.createRadialGradient(
    magnet.x - visualRadius * 0.35,
    magnet.y - visualRadius * 0.35,
    0,
    magnet.x - visualRadius * 0.35,
    magnet.y - visualRadius * 0.35,
    visualRadius * 0.7
  );
  shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  shineGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
  shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = shineGradient;
  ctx.beginPath();
  ctx.arc(magnet.x, magnet.y, visualRadius, 0, Math.PI * 2);
  ctx.fill();

  // Center core with gradient
  const coreGradient = ctx.createRadialGradient(
    magnet.x, magnet.y, 0,
    magnet.x, magnet.y, visualRadius * 0.45
  );
  coreGradient.addColorStop(0, "#1E3A8A");
  coreGradient.addColorStop(1, "#1E40AF");
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(magnet.x, magnet.y, visualRadius * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Cute rotating magnetic field indicators (3 small dots)
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  for (let i = 0; i < 3; i++) {
    const angle = (Date.now() / 1500 + i * (Math.PI * 2 / 3)) % (Math.PI * 2);
    const x = magnet.x + Math.cos(angle) * visualRadius * 0.28;
    const y = magnet.y + Math.sin(angle) * visualRadius * 0.28;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Velocity indicator with trail effect
  if (!isPreview && (Math.abs(magnet.vx) > 0.5 || Math.abs(magnet.vy) > 0.5)) {
    const speed = Math.sqrt(magnet.vx * magnet.vx + magnet.vy * magnet.vy);
    const angle = Math.atan2(magnet.vy, magnet.vx);
    
    // Motion blur trail with cyan glow
    for (let i = 3; i > 0; i--) {
      ctx.globalAlpha = 0.25 * (4 - i) / 3;
      const trailX = magnet.x - Math.cos(angle) * i * 4;
      const trailY = magnet.y - Math.sin(angle) * i * 4;
      const trailGradient = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, visualRadius * 0.8);
      trailGradient.addColorStop(0, "#7DD3FC");
      trailGradient.addColorStop(1, "rgba(125, 211, 252, 0)");
      ctx.fillStyle = trailGradient;
      ctx.beginPath();
      ctx.arc(trailX, trailY, visualRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Preview indicator with pulsing ring
  if (isPreview) {
    const pulsePhase = (Date.now() / 600) % 1;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - pulsePhase * 0.3})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(magnet.x, magnet.y, visualRadius + 6 + pulsePhase * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
