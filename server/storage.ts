// This file is not used by Magnet Game
// Game state is managed in-memory by server/gameServer.ts

export interface IStorage {
  // Storage interface placeholder - not used for this game
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
