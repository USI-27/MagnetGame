import { Magnet, GAME_CONFIG } from "@shared/schema";

export class PhysicsEngine {
  private worldBounds: { width: number; height: number };

  constructor(worldBounds: { width: number; height: number }) {
    this.worldBounds = worldBounds;
  }

  update(magnets: Magnet[], deltaTime: number): string[] {
    const movedMagnetIds: string[] = [];
    const placedMagnets = magnets.filter(m => m.isPlaced);

    // Calculate magnetic forces between all placed magnets
    for (let i = 0; i < placedMagnets.length; i++) {
      const m1 = placedMagnets[i];
      
      for (let j = i + 1; j < placedMagnets.length; j++) {
        const m2 = placedMagnets[j];
        this.applyMagneticForce(m1, m2);
      }
    }

    // Update positions and apply damping
    placedMagnets.forEach((magnet) => {
      // Apply damping (friction)
      magnet.vx *= GAME_CONFIG.DAMPING;
      magnet.vy *= GAME_CONFIG.DAMPING;

      // Limit maximum velocity
      const speed = Math.sqrt(magnet.vx * magnet.vx + magnet.vy * magnet.vy);
      if (speed > GAME_CONFIG.MAX_VELOCITY) {
        const scale = GAME_CONFIG.MAX_VELOCITY / speed;
        magnet.vx *= scale;
        magnet.vy *= scale;
      }

      // Store old position to check for movement
      const oldX = magnet.x;
      const oldY = magnet.y;

      // Update position
      magnet.x += magnet.vx;
      magnet.y += magnet.vy;

      // Boundary collision with bounce
      if (magnet.x - GAME_CONFIG.MAGNET_RADIUS < 0) {
        magnet.x = GAME_CONFIG.MAGNET_RADIUS;
        magnet.vx = Math.abs(magnet.vx) * 0.5;
      } else if (magnet.x + GAME_CONFIG.MAGNET_RADIUS > this.worldBounds.width) {
        magnet.x = this.worldBounds.width - GAME_CONFIG.MAGNET_RADIUS;
        magnet.vx = -Math.abs(magnet.vx) * 0.5;
      }

      if (magnet.y - GAME_CONFIG.MAGNET_RADIUS < 0) {
        magnet.y = GAME_CONFIG.MAGNET_RADIUS;
        magnet.vy = Math.abs(magnet.vy) * 0.5;
      } else if (magnet.y + GAME_CONFIG.MAGNET_RADIUS > this.worldBounds.height) {
        magnet.y = this.worldBounds.height - GAME_CONFIG.MAGNET_RADIUS;
        magnet.vy = -Math.abs(magnet.vy) * 0.5;
      }

      // Check if magnet moved significantly from initial position
      if (magnet.initialX !== undefined && magnet.initialY !== undefined) {
        const distanceFromInitial = Math.sqrt(
          Math.pow(magnet.x - magnet.initialX, 2) + 
          Math.pow(magnet.y - magnet.initialY, 2)
        );
        
        if (distanceFromInitial > GAME_CONFIG.MOVEMENT_THRESHOLD) {
          if (!movedMagnetIds.includes(magnet.id)) {
            movedMagnetIds.push(magnet.id);
          }
        }
      }

      // Stop very slow movement
      if (Math.abs(magnet.vx) < 0.01) magnet.vx = 0;
      if (Math.abs(magnet.vy) < 0.01) magnet.vy = 0;
    });

    return movedMagnetIds;
  }

  private applyMagneticForce(m1: Magnet, m2: Magnet): void {
    const dx = m2.x - m1.x;
    const dy = m2.y - m1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only apply force within range
    if (distance < GAME_CONFIG.MIN_FORCE_DISTANCE || distance > GAME_CONFIG.MAX_FORCE_DISTANCE) {
      return;
    }

    // Magnetic force: F = k / r^2 (always attractive, like real magnets)
    // Negative force = attraction (magnets pull toward each other)
    const forceMagnitude = -GAME_CONFIG.MAGNETIC_STRENGTH / (distance * distance);
    
    // Normalize direction
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Apply force to both magnets (Newton's third law)
    const forceX = dirX * forceMagnitude;
    const forceY = dirY * forceMagnitude;

    // Negative force pulls magnets together
    m1.vx -= forceX;
    m1.vy -= forceY;
    m2.vx += forceX;
    m2.vy += forceY;
  }

  isValidPlacement(x: number, y: number, magnets: Magnet[]): boolean {
    // Check if position is within bounds
    if (x - GAME_CONFIG.MAGNET_RADIUS < 0 || 
        x + GAME_CONFIG.MAGNET_RADIUS > this.worldBounds.width ||
        y - GAME_CONFIG.MAGNET_RADIUS < 0 || 
        y + GAME_CONFIG.MAGNET_RADIUS > this.worldBounds.height) {
      return false;
    }

    // Check if position overlaps with existing magnets
    for (const magnet of magnets) {
      if (magnet.isPlaced) {
        const dx = x - magnet.x;
        const dy = y - magnet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < GAME_CONFIG.MAGNET_RADIUS * 2) {
          return false;
        }
      }
    }

    return true;
  }
}
