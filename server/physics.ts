import { Player, GAME_CONFIG } from "@shared/schema";

export class PhysicsEngine {
  private worldBounds: { width: number; height: number };

  constructor(worldBounds: { width: number; height: number }) {
    this.worldBounds = worldBounds;
  }

  update(players: Map<string, Player>, deltaTime: number): void {
    const playerArray = Array.from(players.values());

    // Calculate magnetic forces between all players
    for (let i = 0; i < playerArray.length; i++) {
      const p1 = playerArray[i];
      
      for (let j = i + 1; j < playerArray.length; j++) {
        const p2 = playerArray[j];
        this.applyMagneticForce(p1, p2);
      }
    }

    // Update positions and apply damping
    playerArray.forEach((player) => {
      // Apply movement input
      if (player.isMoving && (player.targetVx !== 0 || player.targetVy !== 0)) {
        const acceleration = 0.5;
        player.vx += player.targetVx * acceleration;
        player.vy += player.targetVy * acceleration;
      }

      // Apply damping (friction)
      player.vx *= GAME_CONFIG.DAMPING;
      player.vy *= GAME_CONFIG.DAMPING;

      // Limit maximum velocity
      const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
      if (speed > GAME_CONFIG.MAX_VELOCITY) {
        const scale = GAME_CONFIG.MAX_VELOCITY / speed;
        player.vx *= scale;
        player.vy *= scale;
      }

      // Update position
      player.x += player.vx;
      player.y += player.vy;

      // Boundary collision with bounce
      if (player.x - GAME_CONFIG.MAGNET_RADIUS < 0) {
        player.x = GAME_CONFIG.MAGNET_RADIUS;
        player.vx = Math.abs(player.vx) * 0.5;
      } else if (player.x + GAME_CONFIG.MAGNET_RADIUS > this.worldBounds.width) {
        player.x = this.worldBounds.width - GAME_CONFIG.MAGNET_RADIUS;
        player.vx = -Math.abs(player.vx) * 0.5;
      }

      if (player.y - GAME_CONFIG.MAGNET_RADIUS < 0) {
        player.y = GAME_CONFIG.MAGNET_RADIUS;
        player.vy = Math.abs(player.vy) * 0.5;
      } else if (player.y + GAME_CONFIG.MAGNET_RADIUS > this.worldBounds.height) {
        player.y = this.worldBounds.height - GAME_CONFIG.MAGNET_RADIUS;
        player.vy = -Math.abs(player.vy) * 0.5;
      }

      // Stop very slow movement
      if (Math.abs(player.vx) < 0.01) player.vx = 0;
      if (Math.abs(player.vy) < 0.01) player.vy = 0;
    });
  }

  private applyMagneticForce(p1: Player, p2: Player): void {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only apply force within range
    if (distance < GAME_CONFIG.MIN_FORCE_DISTANCE || distance > GAME_CONFIG.MAX_FORCE_DISTANCE) {
      return;
    }

    // Magnetic force: F = k * (p1 * p2) / r^2
    // Positive force = repulsion (same polarity)
    // Negative force = attraction (opposite polarity)
    const forceMagnitude = (p1.polarity * p2.polarity * GAME_CONFIG.MAGNETIC_STRENGTH) / (distance * distance);
    
    // Normalize direction
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Apply force to both players (Newton's third law)
    const forceX = dirX * forceMagnitude;
    const forceY = dirY * forceMagnitude;

    // Positive force pushes away, negative force pulls together
    p1.vx -= forceX;
    p1.vy -= forceY;
    p2.vx += forceX;
    p2.vy += forceY;
  }

  getRandomSpawnPosition(): { x: number; y: number } {
    const margin = GAME_CONFIG.MAGNET_RADIUS * 2;
    return {
      x: margin + Math.random() * (this.worldBounds.width - margin * 2),
      y: margin + Math.random() * (this.worldBounds.height - margin * 2),
    };
  }
}
